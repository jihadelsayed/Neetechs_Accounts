import { NotAuthGuard } from './authentication/services/not-auth.guard';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { UserService } from './authentication/services/user.service';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './authentication/services/auth.guard';
import { HttpClientModule } from '@angular/common/http';
import { NotFoundComponent } from './not-found/not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationComponent,
    SignInComponent,
    SignUpComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [UserService,NotAuthGuard,AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
