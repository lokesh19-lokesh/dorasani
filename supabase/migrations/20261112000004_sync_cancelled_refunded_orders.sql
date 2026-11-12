-- ==============================================================================
-- DORASANI: Sync Admin-Cancelled Orders with Pre-Existing Refunds
-- Version: 20261112000004
-- Purpose: Repairs any order (such as orders cancelled while migration
--          20261112000002 was pending) where public.refunds already recorded an
--          "Admin cancelled order: ..." refund row, but public.orders still had
--          a pre-cancellation order_status / payment_status.
-- Safe & idempotent: can be executed repeatedly without side effects.
-- ==============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

WITH admin_refund_orders AS (
  SELECT DISTINCT ON (r.order_id)
    r.order_id,
    r.created_at AS refund_created_at,
    r.processed_by,
    NULLIF(TRIM(REGEXP_REPLACE(COALESCE(r.notes, ''), '^Admin cancelled order:\s*', '', 'i')), '') AS derived_reason,
    r.refund_reference,
    r.amount_inr,
    r.status AS refund_status
  FROM public.refunds r
  WHERE COALESCE(r.notes, '') ILIKE 'Admin cancelled order:%'
     OR COALESCE(r.refund_reference, '') <> ''
  ORDER BY r.order_id, r.created_at DESC
)
UPDATE public.orders o
SET
  order_status = 'cancelled',
  payment_status = CASE
    WHEN o.payment_status IN ('paid', 'authorized') THEN 'refunded'::public.payment_status_type
    ELSE o.payment_status
  END,
  cancellation_reason = COALESCE(NULLIF(TRIM(o.cancellation_reason), ''), aro.derived_reason, 'Order cancelled by admin'),
  cancelled_at = COALESCE(o.cancelled_at, aro.refund_created_at, o.updated_at, NOW()),
  cancelled_by = COALESCE(o.cancelled_by, aro.processed_by),
  courier_name = CASE
    WHEN EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.order_id = o.id AND s.cancelled_at IS NOT NULL
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.order_id = o.id AND s.cancelled_at IS NULL AND COALESCE(s.tracking_number, '') <> ''
    )
    THEN NULL
    ELSE o.courier_name
  END,
  tracking_id = CASE
    WHEN EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.order_id = o.id AND s.cancelled_at IS NOT NULL
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.shipments s
      WHERE s.order_id = o.id AND s.cancelled_at IS NULL AND COALESCE(s.tracking_number, '') <> ''
    )
    THEN NULL
    ELSE o.tracking_id
  END,
  updated_at = NOW()
FROM admin_refund_orders aro
WHERE o.id = aro.order_id
  AND (
    o.order_status <> 'cancelled'
    OR o.payment_status IN ('paid', 'authorized')
    OR o.cancellation_reason IS NULL
    OR o.cancelled_at IS NULL
  );

UPDATE public.payments p
SET
  status = 'refunded',
  updated_at = NOW()
WHERE p.status IN ('paid', 'authorized')
  AND EXISTS (
    SELECT 1
    FROM public.refunds r
    WHERE r.order_id = p.order_id
      AND r.status IN ('initiated', 'processed')
  );

INSERT INTO public.order_status_history (order_id, previous_status, new_status, changed_by, note)
SELECT
  o.id,
  o.order_status,
  'cancelled'::public.order_status_type,
  o.cancelled_by,
  'Order cancelled by admin: ' || COALESCE(NULLIF(TRIM(o.cancellation_reason), ''), 'Order cancelled by admin') || '.'
FROM public.orders o
WHERE o.order_status = 'cancelled'
  AND NOT EXISTS (
    SELECT 1
    FROM public.order_status_history h
    WHERE h.order_id = o.id
      AND h.new_status = 'cancelled'
  );

NOTIFY pgrst, 'reload schema';

