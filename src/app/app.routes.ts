import { Routes } from '@angular/router';
import { GetCredentialComponent } from './authentication/get-credential/get-credential.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignOutComponent } from './authentication/sign-out/sign-out.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { ResetPasswordConfirmComponent } from './authentication/reset-password-confirm/reset-password-confirm.component';
import { VerifyEmailComponent } from './authentication/verify-email/verify-email.component';

export const routes: Routes = [
  { path: '/*', component: SignInComponent },

  { path: 'getCredential', component: GetCredentialComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'signIn', component: SignInComponent },
  { path: 'signOut', component: SignOutComponent },
  { path: 'resetPassword', component: ResetPasswordComponent },
  { path: 'resetPasswordConfirm', component: ResetPasswordConfirmComponent },
  { path: 'verifyEmail', component: VerifyEmailComponent },
  { path: '**', component: SignInComponent },
];
