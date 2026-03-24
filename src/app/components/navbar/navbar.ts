import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { CartService } from '../../services/cart-service';
import { ProductsService } from '../../services/products-service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AutocompleteLibModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {

  isCartOpen        = false;
  isMobileSearchOpen = false;
  isUserMenuOpen    = false;
  disabledCart      = false;
  hiddenNavbar       = false;
  currentRoute      = '';
  selectedEndowment: any;
  products: any[]   = [];

  private routerSub?: Subscription;

  constructor(
    public  cartService    : CartService,
    public  productService : ProductsService,
    public  authService    : AuthService,
    private router         : Router
  ) {}

  ngOnInit(): void {
    this.products.push(...this.productService.GetProducts());

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = (event as NavigationEnd).urlAfterRedirects;
        this.disabledCart = this.currentRoute.includes('quotation');
        this.isCartOpen = false;
        this.isUserMenuOpen = false;
        this.hiddenNavbar = this.currentRoute.includes('login') || this.currentRoute.includes('admin');
        if (this.disabledCart) {
          this.isCartOpen = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  redirectToHome(): void {
    this.router.navigateByUrl('/');
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/home'),
      error: () => this.router.navigateByUrl('/home'),
    });
  }

  hasStaffAccess(): boolean {
    return this.authService.isStaff();
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    // Close mobile search and user menu when opening cart
    if (this.isCartOpen) {
      this.isMobileSearchOpen = false;
      this.isUserMenuOpen = false;
    }
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    // Close cart and user menu when opening mobile search
    if (this.isMobileSearchOpen) {
      this.isCartOpen = false;
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    // Close cart and mobile search when opening user menu
    if (this.isUserMenuOpen) {
      this.isCartOpen = false;
      this.isMobileSearchOpen = false;
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  removeItem(index: number): void {
    this.cartService.removeItem(index);
  }

  getItem(value: any): void {
    this.selectedEndowment = value;
  }

  searchEndowment(): void {
    if (this.selectedEndowment?.id) {
      this.router.navigateByUrl('/details/' + this.selectedEndowment.id);
      this.selectedEndowment  = null;
      this.isMobileSearchOpen = false;
    }
  }

  sendQuotation(): void {
    this.router.navigateByUrl('/quotation');
  }
}