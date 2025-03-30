import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthFormComponent } from './auth-form/auth-form.component';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    AuthFormComponent,
    RouterLink
  ],
})
export class AuthenticationPage {
  private readonly router = inject(Router);

  // Configuración de la página
  private readonly AUTH_PAGE_CONFIG = {
    login: {
      pageTitle: 'Sign In',
      actionButtonText: 'Sign In',
    },
    signup: {
      pageTitle: 'Create your account',
      actionButtonText: 'Create Account',
    },
    reset: {
      pageTitle: 'Reset your password',
      actionButtonText: 'Reset Password',
    },
  };

  // Obtener la página actual de forma segura
  get currentPage(): keyof typeof this.AUTH_PAGE_CONFIG {
    const page = this.router.url.split('/').pop();
    return page && this.AUTH_PAGE_CONFIG[page as keyof typeof this.AUTH_PAGE_CONFIG] 
      ? page as keyof typeof this.AUTH_PAGE_CONFIG
      : 'login'; // Valor por defecto
  }

  // Propiedades públicas calculadas
  get pageTitle(): string {
    return this.AUTH_PAGE_CONFIG[this.currentPage].pageTitle;
  }

  get actionButtonText(): string {
    return this.AUTH_PAGE_CONFIG[this.currentPage].actionButtonText;
  }

  // Manejo de credenciales
  handleUserCredentials(userCredentials: UserCredentials) {
    switch (this.currentPage) {
      case 'login':
        this.login(userCredentials);
        break;
      case 'signup':
        this.signup(userCredentials);
        break;
      case 'reset':
        this.resetPassword(userCredentials);
        break;
    }
  }

  login({ email, password }: UserCredentials) {
    console.log('Login attempt with:', email, password);
    // Implementar lógica de autenticación aquí
  }

  signup({ email, password }: UserCredentials) {
    console.log('Signup attempt with:', email, password);
    // Implementar lógica de registro aquí
  }

  resetPassword({ email }: UserCredentials) {
    console.log('Password reset for:', email);
    // Implementar lógica de reseteo aquí
  }
}

export interface UserCredentials {
  email: string;
  password?: string;
}