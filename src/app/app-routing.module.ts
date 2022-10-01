import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotAuthGuard } from './authentication/services/not-auth.guard';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { AuthGuard } from './authentication/services/auth.guard';

const routes: Routes = [
  // authentication component
  { path:'signup',component: SignUpComponent,canActivate:[NotAuthGuard] },
  { path:'signin',component: SignInComponent,canActivate:[NotAuthGuard] },
  { path:'',component: AppComponent,canActivate:[AuthGuard] },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
