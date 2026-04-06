import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

interface Seller {
  id: string;
  name: string;
  user: string;
  email: string;
  password: string;
  roles: string[];
}

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
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminUsers implements OnInit {

  sellers: Seller[] = [];

  showPassword = false;
  showPasswords: Record<string, boolean> = {};

  formError = '';

  readonly passwordRules = PASSWORD_RULES;

  sellerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  // ── Live rule results for the checklist UI ────────────────────────────────
  get ruleResults(): boolean[] {
    const val: string = this.sellerForm.get('password')?.value ?? '';
    return this.passwordRules.map(r => r.test(val));
  }

  get allRulesPassed(): boolean { return this.ruleResults.every(Boolean); }

  get confirmValue(): string  { return this.sellerForm.get('confirmPassword')?.value ?? ''; }
  get confirmTouched(): boolean { return !!this.sellerForm.get('confirmPassword')?.touched; }

  get passwordsMatch(): boolean {
    const a = this.sellerForm.get('newPassword')?.value ?? '';
    const b = this.confirmValue;
    return a.length > 0 && b.length > 0 && a === b;
  }

  isInvalid(field: string): boolean {
    const ctrl = this.sellerForm.get(field);
    return !!(ctrl?.invalid && (ctrl.touched || ctrl.dirty));
  }

  /** Returns up to 2 uppercase initials from a full name. */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  togglePassword(id: string): void {
    this.showPasswords = { ...this.showPasswords, [id]: !this.showPasswords[id] };
  }

  loadUsers() {
  this.authService.getUsers().subscribe((res: any) => {
    this.sellers = res;
  });
}

  handleSubmit(): void {
    this.formError = '';
    this.sellerForm.markAllAsTouched();

    if (!this.sellerForm.valid) return;

    const { name, username, email, password } = this.sellerForm.value;

    // Duplicate username check
    if (this.sellers.some(s => s.user === username!.trim())) {
      this.formError = 'Ya existe un vendedor con ese nombre de usuario.';
      return;
    }

    const newSeller: Seller = {
      id: crypto.randomUUID(),
      name: name!.trim(),
      user: username!.trim(),
      email: email!.trim(),
      password: password!.trim(),
      roles: ['vendedor']
    };

    this.authService.createUser(newSeller).subscribe({
      next: () => {
        this.loadUsers();
        this.sellerForm.reset();
      },
      error: () => this.formError = 'Error al crear el vendedor. Intenta nuevamente.'
    });
  }

  handleDelete(id: string): void {
    this.authService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: () => alert('Error al eliminar usuario')
    });
  }
}