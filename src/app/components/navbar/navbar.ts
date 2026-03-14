import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { CartService } from '../../services/cart-service';
import { ProductsService } from '../../services/products-service';

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
  disabledCart      = false;
  currentRoute      = '';
  selectedEndowment: any;
  products: any[]   = [];

  private routerSub?: Subscription;

  constructor(
    public  cartService    : CartService,
    public  productService : ProductsService,
    private router         : Router
  ) {}

  ngOnInit(): void {
    this.products.push(...this.productService.GetProducts());

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = (event as NavigationEnd).urlAfterRedirects;
        this.disabledCart = this.currentRoute.includes('quotation');
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

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    // Close mobile search when opening cart
    if (this.isCartOpen) this.isMobileSearchOpen = false;
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    // Close cart when opening mobile search
    if (this.isMobileSearchOpen) this.isCartOpen = false;
  }

  removeItem(index: number): void {
    this.cartService.getItems().splice(index, 1);
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