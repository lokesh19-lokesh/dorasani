export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailedError {
  code?: string;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
  };
}

export interface RazorpayFailedResponse {
  error: RazorpayFailedError;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency?: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpaySuccessResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
    method?: 'upi' | 'card' | 'netbanking' | 'wallet';
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  retry?: {
    enabled?: boolean;
    max_count?: number;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
    confirm_close?: boolean;
  };
}

export interface RazorpayInstance {
  open: () => void;
  close?: () => void;
  on: (event: 'payment.failed', handler: (response: RazorpayFailedResponse) => void) => void;
}

export interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const RAZORPAY_CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptLoadPromise: Promise<RazorpayConstructor> | null = null;

export function loadRazorpayCheckoutScript(): Promise<RazorpayConstructor> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Razorpay Checkout is only available in browser sessions.'));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<RazorpayConstructor>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src^="${RAZORPAY_CHECKOUT_SCRIPT_URL}"]`
    );

    let timerId: number | undefined;

    let targetScript: HTMLScriptElement | null = existingScript;

    const cleanup = () => {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
        timerId = undefined;
      }
    };

    const handleLoad = () => {
      cleanup();
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        scriptLoadPromise = null;
        reject(new Error('Razorpay SDK loaded without initializing checkout interface.'));
      }
    };

    const handleError = () => {
      cleanup();
      targetScript?.remove();
      scriptLoadPromise = null;
      reject(
        new Error(
          'Unable to load Razorpay Checkout. Please check your internet connection or ad-blocker and retry.'
        )
      );
    };

    timerId = window.setTimeout(() => {
      if (window.Razorpay) {
        cleanup();
        resolve(window.Razorpay);
      } else {
        targetScript?.remove();
        scriptLoadPromise = null;
        reject(
          new Error(
            'Timed out loading Razorpay Checkout. Please check your connection and try again.'
          )
        );
      }
    }, 6000);

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    targetScript = script;
    script.src = RAZORPAY_CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export function formatRazorpayContact(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (digits.length > 10) {
    return `+${digits}`;
  }
  return digits;
}

export type RazorpayModalOutcome =
  | { status: 'success'; response: RazorpaySuccessResponse }
  | { status: 'dismissed' }
  | { status: 'failed'; error: RazorpayFailedError };

export async function openRazorpayCheckout(params: {
  keyId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredMethod?: 'upi' | 'card' | 'netbanking' | 'wallet';
  checkoutSessionId: string;
  description?: string;
  onPaymentFailed?: (error: RazorpayFailedError) => void;
}): Promise<RazorpayModalOutcome> {
  const RazorpaySDK = await loadRazorpayCheckoutScript();

  return new Promise<RazorpayModalOutcome>((resolve, reject) => {
    let settled = false;
    let latestFailure: RazorpayFailedError | null = null;

    const checkoutLogo =
      typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? `${window.location.origin}/assets/fevicon.png`
        : undefined;

    try {
      const instance = new RazorpaySDK({
        key: params.keyId,
        amount: params.amountInPaise,
        currency: params.currency || 'INR',
        name: 'DORASANI',
        description: params.description || 'Luxury South Indian Handloom Order',
        ...(checkoutLogo ? { image: checkoutLogo } : {}),
        order_id: params.razorpayOrderId,
        prefill: {
          name: params.customerName,
          email: params.customerEmail,
          contact: formatRazorpayContact(params.customerPhone),
          ...(params.preferredMethod ? { method: params.preferredMethod } : {}),
        },
        notes: {
          checkout_session_id: params.checkoutSessionId,
          merchant: 'DORASANI',
        },
        theme: {
          color: '#285A3C',
        },
        modal: {
          confirm_close: true,
          escape: true,
          backdropclose: false,
          ondismiss: () => {
            if (settled) return;
            settled = true;
            if (latestFailure) {
              resolve({ status: 'failed', error: latestFailure });
            } else {
              resolve({ status: 'dismissed' });
            }
          },
        },
        handler: (response: RazorpaySuccessResponse) => {
          if (settled) return;
          settled = true;
          resolve({ status: 'success', response });
        },
      });

      instance.on('payment.failed', (failureResp: RazorpayFailedResponse) => {
        latestFailure = failureResp?.error || {
          description: 'Payment attempt failed inside Razorpay.',
        };
        params.onPaymentFailed?.(latestFailure);
      });

      instance.open();
    } catch (err) {
      if (!settled) {
        settled = true;
        reject(err instanceof Error ? err : new Error('Unable to open Razorpay payment popup.'));
      }
    }
  });
}
