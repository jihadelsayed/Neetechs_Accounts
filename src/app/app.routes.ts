import { Routes } from '@angular/router';
import { GetCredentialComponent } from './authentication/get-credential/get-credential.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignOutComponent } from './authentication/sign-out/sign-out.component';
//import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
//import { ResetPasswordConfirmComponent } from './authentication/reset-password-confirm/reset-password-confirm.component';
import { VerifyEmailComponent } from './authentication/verify-email/verify-email.component';

export const routes: Routes = [
  { path: '/*', component: SignInComponent },

  { path: 'getCredential', component: GetCredentialComponent },

  { path: 'login', component: SignInComponent }, // or
  { path: 'signIn', redirectTo: 'login', pathMatch: 'full' }, // optional, for old links
    
  // SIGNUP
  { path: 'signup', component: SignUpComponent },
  { path: 'register', redirectTo: 'signup', pathMatch: 'full' }, // optional alias
  
  { path: 'logout', component: SignOutComponent },
  { path: 'signOut', redirectTo: 'logout', pathMatch: 'full' }, // optional alias

  //{ path: 'resetPassword', component: ResetPasswordComponent },
  //{ path: 'resetPasswordConfirm', component: ResetPasswordConfirmComponent },
  { path: 'verifyEmail', component: VerifyEmailComponent },
  { path: '**', component: SignInComponent },
];
