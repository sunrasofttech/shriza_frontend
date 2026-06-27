import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  mobile = '';
  digits: string[] = ['', '', '', ''];
  countdown = 30;
  private timer?: ReturnType<typeof setInterval>;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.mobile = this.route.snapshot.queryParamMap.get('mobile') || '';
    this.startCountdown();
  }

  ngAfterViewInit(): void {
    this.digitInputs.first?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startCountdown(): void {
    this.countdown = 30;
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else if (this.timer) {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(-1);
    this.digits[index] = value;
    input.value = value;

    if (value && index < this.digits.length - 1) {
      this.digitInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onDigitKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.digitInputs.toArray()[index - 1].nativeElement.focus();
    }
  }

  resendOtp(): void {
    if (this.countdown > 0) {
      return;
    }
    this.startCountdown();
  }

  verifyAndProceed(): void {
    if (this.digits.some((digit) => !digit)) {
      return;
    }
    this.router.navigate(['/home']);
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
