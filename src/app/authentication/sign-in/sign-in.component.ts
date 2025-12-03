import {
  isPlatformBrowser,
  CommonModule,
} from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ActivatedRoute,
  RouterModule,
} from '@angular/router';
import { UserService } from '../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { PhoneService } from '../services/phone-service.service';
import { PasswordService } from '../services/password-service.service';
import { WebAuthnService } from '../services/webauthn.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  providers: [CookieService],
})
export class SignInComponent implements OnInit {
  resendCooldown = 60;
  resendTimer: any;
  canResend = true;

  loginUser: any = {
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

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private cookie: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public phoneService: PhoneService,
    public passwordService: PasswordService,
    private webauthnService: WebAuthnService
  ) {}

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

  startCooldown(seconds: number = 60) {
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
      return !!this.loginUser.phone && this.phoneService.isValidPhone(fullPhone);
    }
  }

  onLoginSubmit(form: NgForm): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!form.valid) return;

    let payload: any;
    if (this.loginUseEmail) {
      payload = {
        email: this.loginUser.email,
        password: this.loginUser.password,
      };
    } else {
      payload = {
        phone: this.phoneService.getFullPhoneNumber(
          this.selectedCountry,
          this.loginUser.phone
        ),
        password: this.loginUser.password,
      };
    }

    this.loginLoading = true;

    this.userService.userAuthentication(payload).subscribe(
      (data: any) => {
        // store user info in browser only
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('UserInfo', JSON.stringify(data.user));
        this.cookie.set('userToken', data.token);
        this.cookie.set('UserInfo', JSON.stringify(data.user));

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
      },
      (error: any) => {
        this.loginLoading = false;
        let msg = 'Login failed';

        if (error.status === 400) {
          if (error.error['non_field_errors'])
            msg = error.error['non_field_errors'];
          else if (error.error['email']) msg = error.error['email'];
          else if (error.error['phone']) msg = error.error['phone'];
          else if (error.error['password']) msg = error.error['password'];
        } else if (error.message) {
          msg = error.message;
        }

        console.log('LOGIN error', error);
        this.loginError = msg;
      }
    );
  }

  loginWithBiometric() {
    if (!isPlatformBrowser(this.platformId)) return;
    const userId = JSON.parse(localStorage.getItem('UserInfo') || '{}').id;
    this.webauthnService
      .login(userId)
      .then((res) => {
        localStorage.setItem('userToken', res.token);
        // you might want to use returnUrl here too later
        window.location.href = this.returnUrl || 'https://neetechs.com/en/';
      })
      .catch((err) => {
        console.error('Biometric login failed', err);
      });
  }

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

  sendLoginOtp() {
    this.phoneService.sendVerificationCode(
      this.selectedCountry,
      this.loginUser.phone,
      () => {
        this.loginStep = 1.5;
        this.startCooldown();
      }
    );
  }

  verifyLoginOtp() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.phoneService.verifyCode(
      this.selectedCountry,
      this.loginUser.phone,
      this.phoneService.phoneVerificationCode,
      (hasPassword) => {
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
    );
  }
}
