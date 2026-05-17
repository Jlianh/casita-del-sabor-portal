import { Component, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface PasswordRule {
  label: string;
  test: (p: string) => boolean;
}

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
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  showPassword = signal(false);
  toastVisible = signal(false);
  toastMessage = signal('');

  form = new FormGroup({
    firstName:        new FormControl('', [Validators.required, Validators.maxLength(100)]),
    lastName:         new FormControl('', [Validators.required, Validators.maxLength(100)]),
    email:           new FormControl('', [Validators.required, Validators.email, Validators.maxLength(255)]),
    phone:           new FormControl('', [Validators.maxLength(20)]),
    password:        new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
    acceptTerms:     new FormControl(false, [Validators.requiredTrue]),
  }, { validators: passwordMatchValidator });

  passwordRules: PasswordRule[] = [
    { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
    { label: 'Una mayúscula',        test: (p) => /[A-Z]/.test(p) },
    { label: 'Una minúscula',        test: (p) => /[a-z]/.test(p) },
    { label: 'Un número',            test: (p) => /[0-9]/.test(p) },
    { label: 'Un símbolo',           test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  get passwordValue(): string  { return this.form.get('password')?.value ?? ''; }
  get confirmValue(): string   { return this.form.get('confirmPassword')?.value ?? ''; }

  allRulesPassed = computed(() => this.passwordRules.every((r) => r.test(this.passwordValue)));

  get passwordsMatch(): boolean {
    return this.passwordValue.length > 0 && this.passwordValue === this.confirmValue;
  }

  get canSubmit(): boolean {
    return this.form.valid && this.allRulesPassed();
  }

  constructor(private router: Router, private authService: AuthService) {}

  togglePassword() { this.showPassword.update((v) => !v); }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }

  ruleClass(rule: PasswordRule): string {
    return rule.test(this.passwordValue) ? 'rule-pass' : 'rule-fail';
  }

  // ── Live rule results for the checklist UI ────────────────────────────────
  get ruleResults(): boolean[] {
    const val: string = this.form.get('password')?.value ?? '';
    return this.passwordRules.map(r => r.test(val));
  }

  handleSubmit(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) return;

    const { firstName, lastName, email, password } = this.form.value;

    const newUser: any = {
      id: crypto.randomUUID(),
      name: `${firstName!.trim()} ${lastName!.trim()}`,
      user: firstName!.trim().toLowerCase() + '.' + lastName!.trim().toLowerCase(),
      email: email!.trim(),
      password: password!.trim(),
      roles: ['cliente']
    };

    this.authService.createClient(newUser).subscribe({
      next: () => {
        this.form.reset();
      },
    });
  }
}