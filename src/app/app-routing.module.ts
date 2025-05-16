import { VerifyEmailComponent } from './authentication/verify-email/verify-email.component';
import { ResetPasswordConfirmComponent } from './authentication/reset-password-confirm/reset-password-confirm.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { SignOutComponent } from './authentication/sign-out/sign-out.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GetCredentialComponent } from './authentication/get-credential/get-credential.component';
import { SocialRedirectComponent } from './authentication/social-redirect/social-redirect.component';
// import { headerRoutes } from './header/header-routing.module';

const routes: Routes = [
  // authentication component
  //{ path:'', pathMatch:'full', redirectTo:'signIn'},
  { path: 'getCredential', component: GetCredentialComponent },
  { path: 'signUp', component: SignUpComponent },
  { path: 'register', component: SignUpComponent },
  { path: 'signIn', component: SignInComponent },
  { path: 'logIn', component: SignInComponent },
  { path: 'signOut', component: SignOutComponent },
  { path: 'resetPassword', component: ResetPasswordComponent },
  { path: 'resetPasswordConfirm', component: ResetPasswordConfirmComponent },
  { path: 'verifyEmail', component: VerifyEmailComponent },
  { path: 'social-login-complete', component: SocialRedirectComponent },

  { path: '**', component: SignInComponent },
];

@NgModule({
  imports: [
    //RouterModule.forChild(headerRoutes),
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
