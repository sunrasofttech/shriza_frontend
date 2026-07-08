import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  mobile = '';
  purpose: 'login' | 'register' = 'login';
  digits: string[] = ['', '', '', ''];
  countdown = 30;
  loading = false;
  errorMsg = '';
  private timer?: ReturnType<typeof setInterval>;

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.mobile = this.route.snapshot.queryParamMap.get('mobile') || '';
    const p = this.route.snapshot.queryParamMap.get('purpose');
    this.purpose = p === 'register' ? 'register' : 'login';
    this.startCountdown();
  }

  ngAfterViewInit(): void {
    this.digitInputs.first?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  startCountdown(): void {
    this.countdown = 30;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.countdown > 0) { this.countdown--; }
      else if (this.timer) { clearInterval(this.timer); }
    }, 1000);
  }

  trackByIndex(index: number): number { return index; }

  onDigitKeydown(index: number, event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const inputs = this.digitInputs.toArray();

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.digits[index] = '';
      input.value = '';
      if (index > 0) inputs[index - 1].nativeElement.focus();
      return;
    }
    if (event.key === 'ArrowLeft' && index > 0)  { inputs[index - 1].nativeElement.focus(); return; }
    if (event.key === 'ArrowRight' && index < 3) { inputs[index + 1].nativeElement.focus(); return; }

    // key === 'Unidentified' means Android virtual keyboard — let onDigitInput handle it
    if (event.key === 'Unidentified') return;

    // Block non-digit printable keys
    if (!/^\d$/.test(event.key)) { event.preventDefault(); return; }

    // Desktop / iOS: handle digit directly, prevent default so input event doesn't also fire
    event.preventDefault();
    this.digits[index] = event.key;
    input.value = event.key;
    if (index < this.digits.length - 1) inputs[index + 1].nativeElement.focus();
  }

  onDigitInput(index: number, event: Event): void {
    // Handles Android where keydown.key = 'Unidentified' (no preventDefault was called)
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').charAt(0) || '';
    this.digits[index] = digit;
    input.value = digit;
    if (digit && index < this.digits.length - 1) {
      this.digitInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onDigitPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const paste = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 4);
    if (!paste) return;
    const inputs = this.digitInputs.toArray();
    paste.split('').forEach((ch, i) => {
      const pos = index + i;
      if (pos < this.digits.length) { this.digits[pos] = ch; inputs[pos].nativeElement.value = ch; }
    });
    const nextFocus = Math.min(index + paste.length, this.digits.length - 1);
    inputs[nextFocus].nativeElement.focus();
  }

  resendOtp(): void {
    if (this.countdown > 0 || this.loading) return;
    this.errorMsg = '';
    const resend$ = this.purpose === 'register'
      ? this.auth.resendRegistrationOtp(this.mobile)
      : this.auth.sendLoginOtp(this.mobile);
    resend$.subscribe({
      next: () => this.startCountdown(),
      error: (err) => { this.errorMsg = err?.error?.message || 'Failed to resend OTP. Please try again.'; }
    });
  }

  verifyAndProceed(): void {
    // Re-read actual DOM values in case this.digits drifted out of sync
    this.digitInputs.toArray().forEach((el, i) => {
      this.digits[i] = el.nativeElement.value.replace(/\D/g, '').slice(-1);
    });
    if (this.digits.some(d => !d) || this.loading) {
      this.errorMsg = 'Please fill in all 4 digits.';
      return;
    }
    this.errorMsg = '';
    this.loading = true;
    const otp = this.digits.join('');
    const verify$ = this.purpose === 'register'
      ? this.auth.verifyPhone(this.mobile, otp)
      : this.auth.verifyLoginOtp(this.mobile, otp);
    verify$.subscribe({
      next: () => { this.loading = false; this.router.navigate(['/home']); },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
