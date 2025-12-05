import {
  CommonModule,
  isPlatformBrowser,
} from '@angular/common';
import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { UserService } from '../services/user.service';
import { PhoneService } from '../services/phone-service.service';
import { PasswordService } from '../services/password-service.service';
import { SocialLoginButtonsComponent } from '../sign-in/social/social-login-buttons.component';
import { SignupPhoneVerificationComponent } from './phone/signup-phone-verification.component';
import { SignupPasswordStepComponent } from './password/signup-password-step.component';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SignupPasswordStepComponent,
    FormsModule,
    RouterModule,
    SocialLoginButtonsComponent,
    SignupPhoneVerificationComponent,
  ],
})
export class SignUpComponent implements OnInit {
  selectedCountry = 'US';
  passwordMismatch = false;

  passwordStrength = { percent: 0, label: '', strengthClass: '' };
  strengthClass = '';

  user: any = {
    name: '',
    username: '',
    email: '',
    phone: '',
    password1: '',
    password2: '',
    smsConsent: false,
  };

  phoneTouched = false;

  host: string | null = null;
  port: string | null = null;
  pathname: string | null = null;
  language: string | null = null;
  returnUrl: string | null = null;

  showReferral = false;
  useEmail = false;
  showPassword = false;
  loading = false;

  step = 1;
  stepLoading = false;

  /** UI error banner */
  globalError: string | null = null;

  constructor(
    private userService: UserService,
    public phoneService: PhoneService,
    public passwordService: PasswordService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.resetForm();

    this.route.queryParams.subscribe((params: any) => {
      this.host = params['host'] ?? null;
      this.port = params['port'] ?? '443';
      this.pathname = params['pathname'] ?? '';
      this.language = params['language'] ?? 'en';
      this.returnUrl = params['return_url'] ?? null;

      console.log('SIGNUP INIT params', params, 'returnUrl =', this.returnUrl);
    });
  }

  // ===== PHONE VERIFY FLOW =====
  verifyCode() {
    this.clearGlobalError();

    this.phoneService.verifyCode(
      this.selectedCountry,
      this.user.phone,
      this.phoneService.phoneVerificationCode,
      (hasPassword: boolean) => {
        if (hasPassword) {
          const target = this.getRedirectTarget();
          window.location.href = target;
        } else {
          this.step = 2;
        }
      }
    );
  }

  // ===== FORM RESET =====
  resetForm(form?: NgForm) {
    if (form) form.reset();

    this.user = {
      name: '',
      username: '',
      email: '',
      phone: '',
      password1: '',
      password2: '',
      smsConsent: false,
    };

    this.useEmail = false;
    this.showPassword = false;
    this.loading = false;
    this.passwordMismatch = false;
    this.passwordStrength = { percent: 0, label: '', strengthClass: '' };
    this.strengthClass = '';
    this.step = 1;
    this.globalError = null;
  }

  clearGlobalError() {
    this.globalError = null;
  }

  // ===== STEPS NAV =====
  nextStep() {
    this.clearGlobalError();
    if (this.step < 3) this.step++;
  }

  prevStep() {
    this.clearGlobalError();
    if (this.step > 1) this.step--;
  }

  nextStepWithSpinner() {
    this.clearGlobalError();
    this.stepLoading = true;

    setTimeout(() => {
      if (this.step === 1 && !this.useEmail) {
        this.phoneService.sendVerificationCode(
          this.selectedCountry,
          this.user.phone,
          () => {
            this.step = 1.5;
          }
        );
      } else {
        this.step++;
      }

      this.stepLoading = false;
    }, 400);
  }

  prevStepWithSpinner() {
    this.clearGlobalError();
    this.stepLoading = true;
    setTimeout(() => {
      this.step--;
      this.stepLoading = false;
    }, 400);
  }

  // ===== SUBMIT (SET PASSWORD) =====
OnSubmit(form: NgForm) {
  if (!isPlatformBrowser(this.platformId)) return;
  this.clearGlobalError();

  this.passwordMismatch = this.user.password1 !== this.user.password2;
  if (this.passwordMismatch || this.user.password1.length < 6) {
    this.passwordStrength.label = 'Too short';
    this.strengthClass = 'weak';
    return;
  }

  this.loading = true;

  if (this.useEmail) {
    // EMAIL FLOW – single register request
    this.userService.registerUser(this.user).subscribe({
      next: (res: any) => {
        const token = res?.token;
        if (token && isPlatformBrowser(this.platformId)) {
          localStorage.setItem('userToken', token);
        }
        const target = this.getRedirectTarget();
        window.location.href = target;
      },
      error: (err) => {
        this.loading = false;
        console.error('Email register failed', err);
        this.handleSetPasswordError(err); // reuse your global error handler
      },
    });
  } else {
    // PHONE FLOW – must be authenticated already and then call setPassword
    this.userService.setPassword(this.user.password1).subscribe({
      next: () => {
        const target = this.getRedirectTarget();
        window.location.href = target;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to set password:', err);
        this.handleSetPasswordError(err);
      },
    });
  }
}


  // ===== REDIRECT TARGET =====
  private getRedirectTarget(): string {
    if (this.returnUrl) {
      try {
        return decodeURIComponent(this.returnUrl);
      } catch {
        return this.returnUrl;
      }
    }
    return 'https://neetechs.com/en/';
  }

  // ===== ERROR HANDLING =====
  private handleSetPasswordError(err: any): void {
    const errorMessage = err?.error?.message || err?.message || 'An error occurred while setting password';
    this.globalError = errorMessage;
    console.error('Password error:', err);
  }

  // ===== VALIDATION =====
  isStep1Valid(): boolean {
    if (this.useEmail) {
      return !!this.user.email && this.isValidEmail(this.user.email);
    } else {
      return (
        !!this.user.phone &&
        this.phoneService.isValidPhone(
          this.phoneService.getFullPhoneNumber(
            this.selectedCountry,
            this.user.phone
          )
        ) &&
        this.user.smsConsent
      );
    }
  }

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  evaluatePasswordStrength(password: string) {
    const result = this.passwordService.evaluatePasswordStrength(password);
    this.passwordStrength.percent = result.percent;
    this.passwordStrength.label = result.label;
    this.strengthClass = result.strengthClass;
  }
}
