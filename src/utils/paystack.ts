export interface PaystackTransactionParams {
  key: string;
  email: string;
  amount: number; // Major currency units; converted to the provider's smallest unit at checkout.
  currency: string;
  ref: string;
  onVerifying?: () => void;
  onSuccess: (response: { reference: string; status: string }) => void | Promise<void>;
  onClose: () => void;
}

export function normalizePaystackCurrency(currency: string): string {
  if (currency === 'GH₵' || currency === 'GHS') return 'GHS';
  if (currency === '₦' || currency === 'NGN') return 'NGN';
  if (currency === '$' || currency === 'USD') return 'USD';
  return currency;
}

export async function verifyPaystackTransaction(reference: string, amount: number, currency: string): Promise<void> {
  const response = await fetch('/api/paystack/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference, amount, currency: normalizePaystackCurrency(currency) })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.verified !== true) {
    throw new Error(result?.error || 'Paystack could not confirm this payment. Please contact support before retrying.');
  }
}

export function generatePaystackReference(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SUSU-PAY-${timestamp}-${randomStr}`;
}

let paystackScriptPromise: Promise<boolean> | null = null;

export function loadPaystackScript(): Promise<boolean> {
  if ((window as any).PaystackPop) return Promise.resolve(true);
  if (paystackScriptPromise) return paystackScriptPromise;

  paystackScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(Boolean((window as any).PaystackPop));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  void paystackScriptPromise.then(loaded => {
    if (!loaded) paystackScriptPromise = null;
  });

  return paystackScriptPromise;
}

export async function initializePaystackCheckout(params: PaystackTransactionParams): Promise<void> {
  const scriptLoaded = await loadPaystackScript();
  if (scriptLoaded && (window as any).PaystackPop) {
    const activeKey = params.key || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
    if (!activeKey) {
      alert('Paystack Public Key is not configured. Please set your Paystack API key in settings or .env');
      params.onClose();
      return;
    }
    const handler = (window as any).PaystackPop.setup({
      key: activeKey,
      email: params.email,
      amount: Math.round(params.amount * 100),
      currency: normalizePaystackCurrency(params.currency),
      ref: params.ref,
      callback: (response: any) => {
        void (async () => {
          const reference = response.reference || params.ref;
          try {
            params.onVerifying?.();
            await verifyPaystackTransaction(reference, params.amount, params.currency);
            await params.onSuccess({ reference, status: 'success' });
          } catch (error) {
            console.error('Paystack transaction verification failed:', error);
            alert(error instanceof Error ? error.message : 'Payment verification failed. Please contact support.');
            params.onClose();
          }
        })();
      },
      onClose: () => {
        params.onClose();
      }
    });
    handler.openIframe();
  } else {
    console.error('Paystack Inline could not be loaded.');
    alert('Paystack checkout could not be loaded. Check your connection and try again.');
    params.onClose();
  }
}
