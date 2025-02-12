export interface Wallet {
  _id?: string | undefined;
  userId: string;
  balance: number;
  currency: string;
}
