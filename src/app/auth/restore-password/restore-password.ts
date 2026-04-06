import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormControl, FormGroup,
         ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

// ── Password rules — each has a label and a test fn ──────────────────────────
interface PasswordRule { label: string; test: (p: string) => boolean; }

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Mínimo 8 caracteres',           test: p => p.length >= 8              },
  { label: 'Al menos 1 mayúscula',           test: p => /[A-Z]/.test(p)           },
  { label: 'Al menos 1 minúscula',           test: p => /[a-z]/.test(p)           },
  { label: 'Al menos 1 número',              test: p => /[0-9]/.test(p)           },
  { label: 'Al menos 1 símbolo (!@#$...)',   test: p => /[^A-Za-z0-9]/.test(p)   },
];

// ── Custom validator: all rules must pass ────────────────────────────────────
const passwordStrengthValidator: ValidatorFn = (ctrl: AbstractControl): ValidationErrors | null => {
  const value: string = ctrl.value ?? '';
  const failed = PASSWORD_RULES.some(r => !r.test(value));
  return failed ? { weakPassword: true } : null;
};

// ── Custom validator: passwords must match ───────────────────────────────────
const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const a = group.get('newPassword')?.value ?? '';
  const b = group.get('confirmPassword')?.value ?? '';
  return a && b && a !== b ? { mismatch: true } : null;
};

@Component({
  selector: 'app-restore-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './restore-password.html',
  styleUrl: './restore-password.css'
})
export class RestorePassword implements OnInit {

  showNew     = false;
  showConfirm = false;

  user: string = '';

  readonly passwordRules = PASSWORD_RULES;

  resetForm = new FormGroup(
    {
      newPassword    : new FormControl('', [passwordStrengthValidator]),
      confirmPassword: new FormControl(''),
    },
    { validators: passwordMatchValidator }
  );

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getUserById(this.activatedRoute.snapshot.params['id']).subscribe({
       next: (data: any) => {
         this.user = data.user;
       }
    });
  }

  // ── Live rule results for the checklist UI ────────────────────────────────
  get ruleResults(): boolean[] {
    const val: string = this.resetForm.get('newPassword')?.value ?? '';
    return this.passwordRules.map(r => r.test(val));
  }

  get allRulesPassed(): boolean { return this.ruleResults.every(Boolean); }

  get confirmValue(): string  { return this.resetForm.get('confirmPassword')?.value ?? ''; }
  get confirmTouched(): boolean { return !!this.resetForm.get('confirmPassword')?.touched; }

  get passwordsMatch(): boolean {
    const a = this.resetForm.get('newPassword')?.value ?? '';
    const b = this.confirmValue;
    return a.length > 0 && b.length > 0 && a === b;
  }

  handleSubmit(): void {
    this.resetForm.markAllAsTouched();
    if (!this.allRulesPassed || !this.passwordsMatch) return;

    this.authService.resetPassword(this.user, this.resetForm.get('newPassword')?.value ?? '').subscribe({
      next: () => {
        alert('Contraseña restablecida exitosamente.');
        this.router.navigateByUrl('/auth/login');
      }
    });
  }
}