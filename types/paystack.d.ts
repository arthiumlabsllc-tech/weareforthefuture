declare module "@paystack/inline-js" {
  interface PaystackPopConfig {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    accessCode?: string;
    label?: string;
    channels?: string[];
    metadata?: Record<string, unknown>;
    onSuccess?: (response: { reference: string; status: string; transaction: string; trxref: string }) => void;
    onClose?: () => void;
    onError?: (error: { message: string }) => void;
    onLoad?: (response: { id: string; customer: { email: string }; accessCode: string }) => void;
    onCancel?: () => void;
    callback?: (response: { reference: string }) => void;
  }

  interface PaystackTransaction {
    openIframe: () => void;
    isOpen: boolean;
    cancel: () => void;
  }

  interface PaystackPopClass {
    setup(config: PaystackPopConfig): PaystackTransaction;
    newTransaction(config: PaystackPopConfig): Promise<PaystackTransaction>;
  }

  const PaystackPop: PaystackPopClass;
  export default PaystackPop;
}
