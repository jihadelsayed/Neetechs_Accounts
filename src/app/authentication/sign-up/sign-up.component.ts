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
import { DeviceIdService } from '../services/device-id.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  private intervalId: any;

  constructor(
    private userService: UserService,
    public phoneService: PhoneService,
    public passwordService: PasswordService,
    private deviceIdService: DeviceIdService,
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

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  // ===== PHONE VERIFY FLOW =====
  verifyCode() {
    this.phoneService.verifyCode(
      this.selectedCountry,
      this.user.phone,
      this.phoneService.phoneVerificationCode,
      (hasPassword: boolean) => {
        // user already has a password -> just redirect back
        if (hasPassword) {
          const target = this.getRedirectTarget();
          window.location.href = target;
        } else {
          // no password yet -> go to password step
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
  }

  // ===== STEPS NAV =====
  nextStep() {
    if (this.step < 3) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  nextStepWithSpinner() {
    this.stepLoading = true;

    setTimeout(() => {
      if (this.step === 1 && !this.useEmail) {
        // send SMS code first
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
    this.stepLoading = true;
    setTimeout(() => {
      this.step--;
      this.stepLoading = false;
    }, 400);
  }

  // ===== SUBMIT (SET PASSWORD) =====
  OnSubmit(form: NgForm) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.passwordMismatch = this.user.password1 !== this.user.password2;

    if (this.passwordMismatch || this.user.password1.length < 6) {
      this.passwordStrength.label = 'Too short';
      this.strengthClass = 'weak';
      return;
    }

    this.loading = true;

    // here your backend already knows which user (from OTP / session),
    // we just set the password
    this.userService.setPassword(this.user.password1).subscribe({
      next: () => {
        const target = this.getRedirectTarget();
        console.log('SIGNUP: password set, redirecting to', target);
        window.location.href = target;
      },
      error: (err) => {
        this.loading = false;
        console.error('Failed to set password:', err);
      },
    });
  }

  // ===== REDIRECT TARGET =====
  private getRedirectTarget(): string {
    // 1️⃣ explicit return_url wins
    if (this.returnUrl) {
      try {
        return decodeURIComponent(this.returnUrl);
      } catch {
        return this.returnUrl;
      }
    }
    // 2️⃣ fallback to main site home
    return 'https://neetechs.com/en/';
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

  // ===== SOCIAL =====
  loginWithGoogle() {
    if (!isPlatformBrowser(this.platformId)) return;
    window.location.href =
      'https://neetechs.com/auth/google/?process=login';
  }

  loginWithFacebook() {
    if (!isPlatformBrowser(this.platformId)) return;
    window.location.href =
      'https://neetechs.com/auth/facebook/?process=login';
  }
}
