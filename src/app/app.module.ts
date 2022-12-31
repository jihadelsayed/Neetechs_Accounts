import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserService } from './authentication/services/user.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NotFoundComponent } from './not-found/not-found.component';
import { JwtInterceptor } from './authorization/Jwt-interceptor.interceptor';
import { AuthorizationComponent } from './authorization/authorization.component';
import { GetCredentialComponent } from './authentication/get-credential/get-credential.component';
import { SignOutComponent } from './authentication/sign-out/sign-out.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { VerifyEmailComponent } from './authentication/verify-email/verify-email.component';
import { ResetPasswordConfirmComponent } from './authentication/reset-password-confirm/reset-password-confirm.component';
import { FacebookComponent } from './authentication/sign-in/facebook/facebook.component';
import { GoogleComponent } from './authentication/sign-in/google/google.component';
import { BlockchainComponent } from './authentication/sign-in/blockchain/blockchain.component';
import { NotAuthGuard } from './authorization/services/not-auth.guard';
import { AuthGuard } from './authorization/services/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    SignInComponent,
    SignOutComponent,
    SignUpComponent,
    NotFoundComponent,
    AuthorizationComponent,
    GetCredentialComponent,
    SignOutComponent,
    ResetPasswordComponent,
    VerifyEmailComponent,
    ResetPasswordConfirmComponent,
    FacebookComponent,
    GoogleComponent,
    BlockchainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    UserService,
    NotAuthGuard,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
