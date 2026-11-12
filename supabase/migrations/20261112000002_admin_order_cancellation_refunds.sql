-- ==============================================================================
-- DORASANI: Admin Order Cancellation, Customer Refund Visibility & Audit Support
-- Version: 20261112000002
-- Non-destructive migration:
--   1. Adds cancelled_at, cancellation_reason, cancelled_by columns on public.orders.
--   2. Adds unique partial index on public.refunds(refund_reference) for idempotency.
--   3. Allows signed-in customers to view their own refunds and order_status_history.
-- ==============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_refunds_reference
  ON public.refunds(refund_reference)
  WHERE refund_reference IS NOT NULL AND refund_reference <> '';

CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

DROP POLICY IF EXISTS "Users can view their own refunds" ON public.refunds;
CREATE POLICY "Users can view their own refunds"
  ON public.refunds FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins manage refunds" ON public.refunds;
CREATE POLICY "Admins manage refunds"
  ON public.refunds FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view their own order status history" ON public.order_status_history;
CREATE POLICY "Users can view their own order status history"
  ON public.order_status_history FOR SELECT
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins manage order status history" ON public.order_status_history;
CREATE POLICY "Admins manage order status history"
  ON public.order_status_history FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

NOTIFY pgrst, 'reload schema';

