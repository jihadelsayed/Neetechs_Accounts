import { SignOutComponent } from './authentication/sign-out/sign-out.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotAuthGuard } from './authentication/services/not-auth.guard';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { AuthGuard } from './authentication/services/auth.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { GetCredentialComponent } from './authentication/get-credential/get-credential.component';

const routes: Routes = [
  // authentication component
  //{ path:'', pathMatch:'full', redirectTo:'signIn'},
  { path:'getCredential',component: GetCredentialComponent },
  { path:'signUp',component: SignUpComponent },
  { path:'signIn',component: SignInComponent },
  { path:'signOut',component: SignOutComponent },
  { path:'**',component: SignInComponent,canActivate:[NotAuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy',useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
