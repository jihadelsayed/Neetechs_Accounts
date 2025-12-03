import { Component, OnInit } from "@angular/core";
import { NgForm, FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { UserService } from "../services/user.service";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { PhoneService } from "../services/phone-service.service";
import { PasswordService } from "../services/password-service.service";
import { DeviceIdService } from "../services/device-id.service";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.component.html",
  styleUrls: ["./sign-up.component.scss"],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class SignUpComponent implements OnInit {
  selectedCountry: string = "US";
  passwordMismatch: boolean = false;

  passwordStrength = { percent: 0, label: "", strengthClass: "" };
  returnUrl: string | null = null;

  strengthClass: string = "";
  user: any = {
    name: "",
    email: "",
    phone: "",
    password1: "",
    password2: "",
    smsConsent: false, //,
    //account_type: ''
  };
  phoneTouched: boolean = false;

  host: string | null = null;
  port: string | null = null;
  pathname: string | null = null;
  language: string | null = null;
  showReferral: boolean = false;
  useEmail: boolean = false;
  showPassword: boolean = false;
  loading: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    public phoneService: PhoneService,
    public passwordService: PasswordService,
    private deviceIdService: DeviceIdService
  ) {}
  private intervalId: any;

ngOnInit(): void {
  this.resetForm();

  this.route.queryParams.subscribe((params: any) => {
    this.host = params['host'] ?? null;
    this.port = params['port'] ?? '443';
    this.pathname = params['pathname'] ?? '';
    this.language = params['language'] ?? 'en';
    this.returnUrl = params['return_url'] ?? null;
  });
}

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
verifyCode() {
  this.phoneService.verifyCode(
    this.selectedCountry,
    this.user.phone,
    this.phoneService.phoneVerificationCode,
    (hasPassword: boolean) => {
      if (hasPassword) {
        // ✅ Prefer explicit return_url if provided
        if (this.returnUrl) {
          let target = this.returnUrl;
          try {
            target = decodeURIComponent(this.returnUrl);
          } catch {}
          window.location.href = target;
          return;
        }

        const redirectHost = this.host ?? 'neetechs.com';
        const redirectPath = this.pathname ?? '';
        const finalRedirect = `https://${redirectHost}${redirectPath}`;
        window.location.href = finalRedirect;
      } else {
        this.step = 2;
      }
    }
  );
}


  resetForm(form?: NgForm) {
    if (form) form.reset();

    this.user = {
      name: "",
      username: "",
      email: "",
      phone: "",
      password1: "",
      password2: "",
      smsConsent: false, // ,
      // account_type: ''
    };

    this.useEmail = false;
    this.showPassword = false;
    this.loading = false;
  }
  step: number = 1;

  nextStep() {
    if (this.step < 3) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  stepLoading: boolean = false;

  nextStepWithSpinner() {
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
    this.stepLoading = true;
    setTimeout(() => {
      this.step--;
      this.stepLoading = false;
    }, 400);
  }

OnSubmit(form: NgForm) {
  this.passwordMismatch = this.user.password1 !== this.user.password2;

  if (this.passwordMismatch || this.user.password1.length < 6) {
    this.passwordStrength.label = 'Too short';
    this.strengthClass = 'weak';
    return;
  }

  this.loading = true;

  this.userService.setPassword(this.user.password1).subscribe({
    next: () => {
      // ✅ Prefer explicit return_url
      if (this.returnUrl) {
        let target = this.returnUrl;
        try {
          target = decodeURIComponent(this.returnUrl);
        } catch {}
        window.location.href = target;
        return;
      }

      const redirectHost = this.host ?? 'neetechs.com';
      const redirectPath = this.pathname ?? '';
      const finalRedirect = `https://${redirectHost}${redirectPath}`;
      window.location.href = finalRedirect;
    },
    error: (err) => {
      this.loading = false;
      console.error('Failed to set password:', err);
    },
  });
}


  isStep1Valid(): boolean {
    if (this.useEmail) {
      return !!this.user.email && this.isValidEmail(this.user.email);
    } else {
      return (
        !!this.user.phone &&
        this.phoneService.isValidPhone(this.user.phone) &&
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
    loginWithGoogle() {
      const url = "https://neetechs.com/auth/google/?process=login";
      window.location.href = url;
    }
    loginWithFacebook() {
      const url = "https://neetechs.com/auth/facebook/?process=login";
      window.location.href = url;
    }
}
