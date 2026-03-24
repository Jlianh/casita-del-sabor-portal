import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

interface Seller {
  id: string;
  name: string;
  user: string;
  password: string;
  roles: string[];
}

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

  sellerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadUsers();
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

    const { name, username, password } = this.sellerForm.value;

    // Duplicate username check
    if (this.sellers.some(s => s.user === username!.trim())) {
      this.formError = 'Ya existe un vendedor con ese nombre de usuario.';
      return;
    }

    const newSeller: Seller = {
      id: crypto.randomUUID(),
      name: name!.trim(),
      user: username!.trim(),
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