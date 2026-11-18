export interface CourierCancellationInfo {
  isCancelledInCourier: boolean;
  reason?: string;
  cancelledAt?: string;
}

const CANCEL_PHRASE_REGEX =
  /\b(seller\s+cancell?ed|order\s+cancell?ed|cancell?ed\s+by\s+(?:the\s+)?(?:seller|client|admin|shipper|merchant)|shipment\s+cancell?ed|cancell?ed\s+order|pickup\s+cancell?ed)\b/i;

const EXACT_CANCEL_STATUS_REGEX = /^\s*(order\s+)?cancell?ed\s*$/i;

function isCancelText(text?: string | null): boolean {
  if (!text) return false;
  const trimmed = String(text).trim();
  if (!trimmed) return false;
  return EXACT_CANCEL_STATUS_REGEX.test(trimmed) || CANCEL_PHRASE_REGEX.test(trimmed);
}

/**
 * Inspects Delhivery / courier shipment rows (raw DB rows, mapped OrderShipment,
 * or live tracking payloads) to determine whether the shipment was cancelled
 * in Delhivery One (e.g., "Not Picked" with "Seller cancelled the order",
 * StatusType "CN", NSL "EOD-108", or cancelled_at set).
 */
export function extractShipmentCancellationInfo(
  input: any | any[] | null | undefined
): CourierCancellationInfo {
  const list = Array.isArray(input) ? input : input ? [input] : [];

  for (const item of list) {
    if (!item || typeof item !== 'object') continue;

    const cancelledAt = item.cancelled_at || item.cancelledAt || undefined;
    const cancellationReason = item.cancellation_reason || item.cancellationReason || undefined;
    const statusType = String(item.status_type || item.statusType || '').trim().toUpperCase();
    const statusCode = String(item.status_code || item.statusCode || '').trim().toUpperCase();
    const currentStatus = String(item.current_status || item.currentStatus || '').trim();
    const topInstructions = String(item.instructions || item.status_instructions || '').trim();

    const rawScans: any[] = Array.isArray(item.scans)
      ? item.scans
      : Array.isArray(item.history)
        ? item.history
        : [];

    // Find the first scan that explicitly indicates cancellation
    let matchedScanReason: string | undefined;
    let matchedScanTime: string | undefined;
    let scanIndicatesCancel = false;

    for (const s of rawScans) {
      if (!s || typeof s !== 'object') continue;
      const scanText = String(s.scan || s.Scan || '').trim();
      const scanType = String(s.scanType || s.ScanType || '').trim().toUpperCase();
      const scanCode = String(s.statusCode || s.StatusCode || '').trim().toUpperCase();
      const scanInstr = String(s.instructions || s.Instructions || '').trim();
      const scanTime = s.dateTime || s.ScanDateTime || s.formattedTime || undefined;

      if (
        scanType === 'CN' ||
        scanCode === 'CN' ||
        scanCode === 'EOD-108' ||
        isCancelText(scanText) ||
        isCancelText(scanInstr)
      ) {
        scanIndicatesCancel = true;
        matchedScanReason = scanInstr || scanText || 'Cancelled in Delhivery One';
        matchedScanTime = scanTime ? String(scanTime) : undefined;
        break;
      }
    }

    const topIndicatesCancel =
      Boolean(cancelledAt) ||
      statusType === 'CN' ||
      statusCode === 'CN' ||
      statusCode === 'EOD-108' ||
      isCancelText(currentStatus) ||
      isCancelText(topInstructions);

    if (topIndicatesCancel || scanIndicatesCancel) {
      return {
        isCancelledInCourier: true,
        reason:
          cancellationReason ||
          matchedScanReason ||
          (isCancelText(topInstructions) ? topInstructions : undefined) ||
          (isCancelText(currentStatus) ? currentStatus : undefined) ||
          'Order cancelled in Delhivery One',
        cancelledAt: cancelledAt || matchedScanTime || item.statusDateTime || item.updated_at || undefined,
      };
    }
  }

  return { isCancelledInCourier: false };
}
