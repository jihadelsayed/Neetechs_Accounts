import { PhoneService } from '@/authentication/services/phone-service.service';
import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-phone-otp-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-otp-login.component.html',
  styleUrls: ['../sign-in.component.scss'],
})
export class PhoneOtpLoginComponent implements OnInit, OnDestroy {
  @Input() selectedCountry: string = 'US';
  @Input() phone: string = '';
  @Input() returnUrl: string | null = null;

  verificationCode = '';
  loading = false;
  error: string | null = null;

  resendCooldown = 60;
  canResend = true;
  private resendTimer: any;

  constructor(public phoneService: PhoneService) {}

  ngOnInit(): void {
    // Automatically send code when this step is shown
    this.sendCode();
  }

  ngOnDestroy(): void {
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
  }

  get formattedPhone(): string {
    return this.phoneService.getFullPhoneNumber(
      this.selectedCountry,
      this.phone
    );
  }

  sendCode(): void {
    this.error = null;

    if (!this.phone) {
      this.error = 'Phone number is missing.';
      return;
    }

    this.phoneService.sendVerificationCode(
      this.selectedCountry,
      this.phone,
      () => {
        this.startCooldown();
      }
    );
  }

  resendCode(): void {
    if (!this.canResend || this.loading) return;
    this.sendCode();
  }

  verifyCode(): void {
    if (!this.verificationCode) {
      this.error = 'Please enter the verification code.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.phoneService.verifyCode(
      this.selectedCountry,
      this.phone,
      this.verificationCode,
      (hasPassword: boolean) => {
        this.loading = false;
        this.redirectAfterOtp();
      }
    );
  }

  private redirectAfterOtp(): void {
    if (this.returnUrl) {
      let target = this.returnUrl;
      try {
        target = decodeURIComponent(this.returnUrl);
      } catch {}
      window.location.href = target;
      return;
    }

    const fallback = 'https://neetechs.com/en/';
    window.location.href = fallback;
  }

  private startCooldown(seconds: number = 60): void {
    this.canResend = false;
    this.resendCooldown = seconds;
    if (this.resendTimer) {
      clearInterval(this.resendTimer);
    }
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        this.canResend = true;
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }
}
