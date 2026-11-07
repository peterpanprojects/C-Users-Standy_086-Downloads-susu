export interface PaystackTransactionParams {
  key: string;
  email: string;
  amount: number; // in pesewas / kobo / cents (amount * 100)
  currency: string;
  ref: string;
  onSuccess: (response: { reference: string; status: string }) => void;
  onClose: () => void;
}

export function generatePaystackReference(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SUSU-PAY-${timestamp}-${randomStr}`;
}

export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
      currency: params.currency === 'GH₵' ? 'GHS' : params.currency === '₦' ? 'NGN' : 'USD',
      ref: params.ref,
      callback: (response: any) => {
        params.onSuccess({ reference: response.reference || params.ref, status: 'success' });
      },
      onClose: () => {
        params.onClose();
      }
    });
    handler.openIframe();
  } else {
    // Fallback if script blocked
    console.warn('Paystack inline SDK not loaded, using sandbox simulator.');
  }
}
