export type PaymentMethod = 'Instapay' | 'VodafoneCash' | 'BankTransfer';

export interface Payment {
  id: number;
  transactionIds: number[];
  buyerId: number;
  amount: number;
  method: PaymentMethod;
  status: 'Pending' | 'Approved' | 'Rejected';
  proofImageUrl?: string;
  note?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  requestIds: number[];
  method: PaymentMethod;
  proofImage: File;
  note?: string;
  totalAmount: number;
}

export interface PaymentAccount {
  method: PaymentMethod;
  accountNumber: string;
  accountName: string;
  instructions: string;
}
