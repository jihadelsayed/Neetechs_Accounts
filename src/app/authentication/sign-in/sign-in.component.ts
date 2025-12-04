import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { PhoneService } from '../services/phone-service.service';
import { PasswordService } from '../services/password-service.service';
import { WebAuthnService } from '../services/webauthn.service';
import { AuthService } from '@/services/auth.service';
import { BiometricLoginButtonComponent } from './biometric/biometric-login-button.component';
import { SocialLoginButtonsComponent } from './social/social-login-buttons.component';
import { PhoneOtpLoginComponent } from './phone/phone-otp-login.component';

interface LoginUser {
  email: string;
  phone: string;
  password: string;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    // BiometricLoginButtonComponent,
    // SocialLoginButtonsComponent,
    PhoneOtpLoginComponent
  ],
  providers: [CookieService],
})
export class SignInComponent implements OnInit {
  // ───────────────────────────────────────────────
  // State
  // ───────────────────────────────────────────────
  resendCooldown = 60;
  resendTimer: any;
  canResend = true;

  loginUser: LoginUser = {
    email: '',
    phone: '',
    password: '',
  };

  loginStep = 1;
  loginUseEmail = false;
  loginLoading = false;
  loginError = '';
  showPassword = false;
  phoneTouched = false;
  selectedCountry = 'US';

  language = 'en';
  host: string | null = null;
  port: string | null = null;
  pathname: string | null = null;
  returnUrl: string | null = null;

  // ───────────────────────────────────────────────
  // DI
  // ───────────────────────────────────────────────
  constructor(
    private route: ActivatedRoute,
    private cookie: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public phoneService: PhoneService,
    public passwordService: PasswordService,
    private webauthnService: WebAuthnService,
    private authService: AuthService
  ) {}

  // ───────────────────────────────────────────────
  // Lifecycle
  // ───────────────────────────────────────────────
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      this.host = params['host'] ?? null;
      this.port = params['port'] ?? '443';
      this.pathname = params['pathname'] ?? '';
      this.language = params['language'] ?? 'en';
      this.returnUrl = params['return_url'] ?? null;

      console.log('INIT params', params, 'returnUrl =', this.returnUrl);
    });
  }

  // ───────────────────────────────────────────────
  // Step / cooldown logic
  // ───────────────────────────────────────────────
  startCooldown(seconds: number = 60): void {
    this.canResend = false;
    this.resendCooldown = seconds;
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        this.canResend = true;
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  nextLoginStep(): void {
    if (this.isLoginStep1Valid()) {
      this.loginStep = 2;
    }
  }

  isLoginStep1Valid(): boolean {
    if (this.loginUseEmail) {
      return !!this.loginUser.email && this.isValidEmail(this.loginUser.email);
    } else {
      const fullPhone = this.phoneService.getFullPhoneNumber(
        this.selectedCountry,
        this.loginUser.phone
      );
      return (
        !!this.loginUser.phone && this.phoneService.isValidPhone(fullPhone)
      );
    }
  }

  // ───────────────────────────────────────────────
  // Main login submit
  // ───────────────────────────────────────────────
  onLoginSubmit(form: NgForm): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!form.valid) return;
    if (!this.loginUser.password) return;

    const identifier = this.buildLoginIdentifier();

    this.loginLoading = true;
    this.loginError = '';

    this.authService
      .login({ identifier, password: this.loginUser.password })
      .subscribe({
        next: (data: any) => {
          this.loginLoading = false;
          this.storeSession(data);
          this.redirectAfterLogin();
        },
        error: (error: any) => {
          this.loginLoading = false;
          console.log('LOGIN error', error);
          this.loginError = this.extractLoginError(error);
        },
      });
  }

  // Build identifier string used by backend (email or full phone)
  private buildLoginIdentifier(): string {
    if (this.loginUseEmail) {
      return this.loginUser.email;
    }
    return this.phoneService.getFullPhoneNumber(
      this.selectedCountry,
      this.loginUser.phone
    );
  }

  // Persist token + user in both localStorage and cookies (for compatibility)
  private storeSession(data: any): void {
    if (!data) return;

    if (data.token) {
      localStorage.setItem('userToken', data.token);
      this.cookie.set('userToken', data.token);
    }

    if (data.user) {
      const userJson = JSON.stringify(data.user);
      localStorage.setItem('UserInfo', userJson);
      this.cookie.set('UserInfo', userJson);
    }
  }

  // Handle post-login redirects (return_url or fallback)
  private redirectAfterLogin(): void {
    console.log('LOGIN success, returnUrl =', this.returnUrl);

    // 1️⃣ Prefer explicit return_url
    if (this.returnUrl) {
      let target = this.returnUrl;
      try {
        target = decodeURIComponent(this.returnUrl);
      } catch {}
      console.log('Redirecting to', target);
      window.location.href = target;
      return;
    }

    // 2️⃣ Fallback: main site home
    const fallback = 'https://neetechs.com/en/';
    console.log('No return_url, redirecting to', fallback);
    window.location.href = fallback;
  }

  // Extract user-friendly error message from backend response
  private extractLoginError(error: any): string {
    let msg = 'Login failed';

    if (!error) return msg;

    if (error.status === 0) {
      return 'Connection error, please try again.';
    }

    const e = error.error || error;

    if (e.non_field_errors) {
      return Array.isArray(e.non_field_errors)
        ? e.non_field_errors.join(', ')
        : e.non_field_errors;
    }
    if (e.email) return e.email;
    if (e.phone) return e.phone;
    if (e.password) return e.password;
    if (e.detail) return e.detail;

    return error.message || msg;
  }

  // ───────────────────────────────────────────────
  // Validation helpers
  // ───────────────────────────────────────────────
  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  isValidPhone(phone: string): boolean {
    return this.phoneService.isValidPhone(phone);
  }

  getFullPhoneNumber(): string {
    return this.phoneService.getFullPhoneNumber(
      this.selectedCountry,
      this.loginUser.phone
    );
  }

  // ───────────────────────────────────────────────
  // OTP login via PhoneService
  // ───────────────────────────────────────────────
sendLoginOtp(): void {
  this.loginStep = 1.5;
}


}
