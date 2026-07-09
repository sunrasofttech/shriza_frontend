import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  walletBalance: number;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  avatarUrl: string | null;
  avatarThumbnailUrl: string | null;
  referralCode: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE         = `${environment.apiUrl}/api/user/auth`;
  private readonly PROFILE_BASE = `${environment.apiUrl}/api/user/me`;
  private readonly OPTS         = { withCredentials: true };

  private _user = new BehaviorSubject<AuthUser | null>(null);
  readonly user$ = this._user.asObservable();

  get currentUser(): AuthUser | null { return this._user.value; }
  get isLoggedIn(): boolean { return !!this._user.value; }

  constructor(private http: HttpClient) {}

  register(payload: { name: string; email: string; phone: string; password: string; confirmPassword: string }) {
    return this.http.post<any>(`${this.BASE}/register`, payload);
  }

  verifyPhone(phone: string, otp: string) {
    return this.http.post<any>(
      `${this.BASE}/verify-phone`, { phone, otp }, { withCredentials: true }
    ).pipe(tap(res => { if (res?.data?.user) this._user.next(res.data.user); }));
  }

  resendRegistrationOtp(phone: string) {
    return this.http.post<any>(`${this.BASE}/resend-otp`, { phone });
  }

  login(email: string, password: string, rememberMe = false) {
    return this.http.post<any>(
      `${this.BASE}/login`, { email, password, rememberMe }, { withCredentials: true }
    ).pipe(tap(res => { if (res?.data?.user) this._user.next(res.data.user); }));
  }

  sendLoginOtp(phone: string) {
    return this.http.post<any>(`${this.BASE}/send-login-otp`, { phone });
  }

  verifyLoginOtp(phone: string, otp: string, rememberMe = false) {
    return this.http.post<any>(
      `${this.BASE}/verify-login-otp`, { phone, otp, rememberMe }, { withCredentials: true }
    ).pipe(tap(res => { if (res?.data?.user) this._user.next(res.data.user); }));
  }

  forgotPassword(email?: string, phone?: string) {
    return this.http.post<any>(`${this.BASE}/forgot-password`, email ? { email } : { phone });
  }

  verifyResetOtp(otp: string, email?: string, phone?: string) {
    return this.http.post<any>(`${this.BASE}/verify-reset-otp`, email ? { email, otp } : { phone, otp });
  }

  resetPassword(resetToken: string, newPassword: string, confirmPassword: string) {
    return this.http.post<any>(`${this.BASE}/reset-password`, { resetToken, newPassword, confirmPassword });
  }

  fetchMe() {
    return this.http.get<any>(`${this.BASE}/me`, this.OPTS).pipe(
      tap(res => { if (res?.data?.user) this._user.next(res.data.user); })
    );
  }

  fetchProfile() {
    return this.http.get<any>(this.PROFILE_BASE, this.OPTS).pipe(
      tap(res => { if (res?.data?.user) this._user.next(res.data.user); })
    );
  }

  updateProfile(name: string) {
    return this.http.patch<any>(this.PROFILE_BASE, { name }, this.OPTS).pipe(
      tap(res => { if (res?.data?.user) this._user.next(res.data.user); })
    );
  }

  uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);
    return this.http.post<any>(`${this.PROFILE_BASE}/avatar`, fd, this.OPTS).pipe(
      tap(res => { if (res?.data?.user) this._user.next(res.data.user); })
    );
  }

  removeAvatar() {
    return this.http.delete<any>(`${this.PROFILE_BASE}/avatar`, this.OPTS).pipe(
      tap(res => { if (res?.data?.user) this._user.next(res.data.user); })
    );
  }

  logout() {
    return this.http.post<any>(`${this.BASE}/logout`, {}, this.OPTS).pipe(
      tap(() => this._user.next(null))
    );
  }
}
