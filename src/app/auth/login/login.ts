import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

 
  errorMessage = '';

  showPassword = false;
  showForgot   = false;

  // ── Login form ───────────────────────────────────────────
  loginForm = new FormGroup({
    user   : new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  // ── Forgot password form ─────────────────────────────────
  forgotForm = new FormGroup({
    forgotEmail: new FormControl('', [Validators.required, Validators.email]),
  });


  constructor(private authService: AuthService, private router: Router) {}

  isInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && (control.touched || control.dirty));
  }

  handleSubmit(): void {
    this.loginForm.markAllAsTouched();

    if (!this.loginForm.valid) return;

    const { user, password } = this.loginForm.value;

    this.authService.login(user!, password!).subscribe({
      next: () => {
        this.errorMessage = '';
        this.router.navigateByUrl('/catalog');
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al iniciar sesión. Revisa credenciales.';
      }
    });
  }

  isForgotInvalid(field: string): boolean {
    const control = this.forgotForm.get(field);
    return !!(control?.invalid && (control.touched || control.dirty));
  }

  closeForgot(): void {
    this.showForgot = false;
    this.forgotForm.reset();
  }

  handleForgotSubmit(): void {
    this.forgotForm.markAllAsTouched();
    if (!this.forgotForm.valid) return;

    this.authService.sendRestoreEmail(this.forgotForm.value.forgotEmail!).subscribe({
      next: () => {
        alert('Si el correo existe en nuestro sistema, recibirás un email con instrucciones para restablecer tu contraseña.');
        this.closeForgot();
      }
    });
  }
}