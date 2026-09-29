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

  interface ResumedTransaction {
    getStatus(): { status: string | null; id?: string; checkoutUrl?: string };
  }

  interface PaystackInstance {
    resumeTransaction(accessCode: string, callbacks: {
      onSuccess?: (response: { reference: string }) => void;
      onCancel?: () => void;
      onError?: (error: { message: string }) => void;
      onLoad?: () => void;
    }): ResumedTransaction;
    cancelTransaction(transaction: ResumedTransaction): void;
  }

  interface PaystackPopClass {
    new (): PaystackInstance;
    setup(config: PaystackPopConfig): PaystackTransaction;
    newTransaction(config: PaystackPopConfig): Promise<PaystackTransaction>;
  }

  const PaystackPop: PaystackPopClass;
  export default PaystackPop;
}
