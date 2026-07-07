import { AfterViewChecked, Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

type ForgotStep = 'email' | 'otp' | 'password';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements AfterViewChecked, OnDestroy {
  @ViewChildren('otpDigit') otpDigits!: QueryList<ElementRef<HTMLInputElement>>;

  step: ForgotStep = 'email';

  email = '';
  digits: string[] = ['', '', '', ''];
  newPassword = '';
  confirmPassword = '';
  loading = false;
  errorMsg = '';
  successMsg = '';
  countdown = 0;

  private resetToken = '';
  private timer?: ReturnType<typeof setInterval>;
  private shouldFocusFirst = false;

  constructor(private router: Router, private auth: AuthService) {}

  ngAfterViewChecked(): void {
    if (this.shouldFocusFirst && this.otpDigits?.first) {
      this.otpDigits.first.nativeElement.focus();
      this.shouldFocusFirst = false;
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private startCountdown(): void {
    this.countdown = 30;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.countdown > 0) { this.countdown--; }
      else if (this.timer) { clearInterval(this.timer); }
    }, 1000);
  }

  sendOtpCode(): void {
    if (!this.email) { this.errorMsg = 'Please enter your email address.'; return; }
    this.errorMsg = '';
    this.loading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.digits = ['', '', '', ''];
        this.step = 'otp';
        this.shouldFocusFirst = true;
        this.startCountdown();
      },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Failed to send OTP.'; }
    });
  }

  resendCode(): void {
    if (this.countdown > 0 || this.loading) return;
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;
    this.auth.forgotPassword(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'OTP resent to your email.';
        this.digits = ['', '', '', ''];
        this.shouldFocusFirst = true;
        this.startCountdown();
      },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Failed to resend OTP.'; }
    });
  }

  onDigitKeydown(index: number, event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const inputs = this.otpDigits.toArray();

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.digits[index] = '';
      input.value = '';
      if (index > 0) inputs[index - 1].nativeElement.focus();
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0)  { inputs[index - 1].nativeElement.focus(); return; }
    if (event.key === 'ArrowRight' && index < 3) { inputs[index + 1].nativeElement.focus(); return; }
    if (!/^\d$/.test(event.key)) { event.preventDefault(); return; }

    event.preventDefault();
    this.digits[index] = event.key;
    input.value = event.key;
    if (index < this.digits.length - 1) inputs[index + 1].nativeElement.focus();
  }

  onDigitPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const paste = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 4);
    if (!paste) return;
    const inputs = this.otpDigits.toArray();
    paste.split('').forEach((ch, i) => {
      const pos = index + i;
      if (pos < this.digits.length) { this.digits[pos] = ch; inputs[pos].nativeElement.value = ch; }
    });
    const nextFocus = Math.min(index + paste.length, this.digits.length - 1);
    inputs[nextFocus].nativeElement.focus();
  }

  verifyOtp(): void {
    this.otpDigits.toArray().forEach((el, i) => {
      this.digits[i] = el.nativeElement.value.replace(/\D/g, '').slice(-1);
    });
    if (this.digits.some(d => !d)) { this.errorMsg = 'Please fill in all 4 digits.'; return; }
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = true;
    const otp = this.digits.join('');
    this.auth.verifyResetOtp(otp, this.email).subscribe({
      next: (res) => {
        this.loading = false;
        this.resetToken = res?.data?.resetToken || '';
        this.step = 'password';
      },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Invalid OTP. Please try again.'; }
    });
  }

  updatePassword(): void {
    if (!this.newPassword) { this.errorMsg = 'Please enter a new password.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.errorMsg = 'Passwords do not match.'; return; }
    this.errorMsg = '';
    this.loading = true;
    this.auth.resetPassword(this.resetToken, this.newPassword, this.confirmPassword).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/login']); },
      error: (err) => { this.loading = false; this.errorMsg = err?.error?.message || 'Failed to reset password.'; }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
