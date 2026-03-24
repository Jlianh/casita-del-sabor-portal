import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login  {

  showPassword = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  loginForm = new FormGroup({
    user   : new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    remember: new FormControl(false),
  });
  
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
}
