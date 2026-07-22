import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface WalletInfo {
  balance: number;
  cashbackEarned: number;
  referralCode: string;
  referralEarnings: number;
  referralCount: number;
}

export interface WalletTx {
  id: string;
  type: 'credit' | 'debit';
  category: string;
  label: string;
  amount: number;
  description: string;
  referenceId: string | null;
  balanceAfter: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly BASE = `${environment.apiUrl}/api/user/wallet`;
  private readonly OPTS = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getWallet() {
    return this.http.get<any>(this.BASE, this.OPTS);
  }

  getTransactions(page = 1, limit = 20) {
    return this.http.get<any>(`${this.BASE}/transactions`, {
      ...this.OPTS,
      params: { page: String(page), limit: String(limit) }
    });
  }

  addFunds(amount: number) {
    return this.http.post<any>(`${this.BASE}/add-funds`, { amount }, this.OPTS);
  }

  verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    return this.http.post<any>(`${this.BASE}/verify-payment`, {
      razorpayOrderId, razorpayPaymentId, razorpaySignature
    }, this.OPTS);
  }
}
