import { NotAuthGuard } from './authentication/services/not-auth.guard';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';
import { UserService } from './authentication/services/user.service';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './authentication/services/auth.guard';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NotFoundComponent } from './not-found/not-found.component';
import { JwtInterceptor } from './authentication/Jwt-interceptor.interceptor';
import { AuthorizationComponent } from './authorization/authorization.component';
import { GetCredentialComponent } from './authentication/get-credential/get-credential.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    SignInComponent,
    SignUpComponent,
    NotFoundComponent,
    AuthorizationComponent,
    GetCredentialComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },UserService,NotAuthGuard,AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
