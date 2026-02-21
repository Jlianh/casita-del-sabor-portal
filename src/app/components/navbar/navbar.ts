import { Component} from '@angular/core';
import { CartService } from '../../services/cart-service';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ProductsService } from '../../services/products-service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-navbar',
  imports: [AutocompleteLibModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  constructor(public cartService : CartService, public productService: ProductsService, private router: Router) {}

  isCartOpen = false;

  disabledCart = false;

  currentRoute: string = '';

  private routerSub?: Subscription;

  selectedEndowment: any;

  products: any[] = [];

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

    console.log(this.currentRoute);
  }

  redirectToHome(): void {
    this.router.navigateByUrl('/');
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  removeItem(index: number): void {
    console.log('Current cart items before removal:', this.cartService.getItems());
    console.log('Removing item at index:', index);
    this.cartService.getItems().splice(index, 1);
  }

  getItem(value: any): void {
    this.selectedEndowment = value;
    console.log('Selected endowment:', this.selectedEndowment);
  }

  searchEndowment(): void {
    console.log(this.selectedEndowment);
    if (this.selectedEndowment?.id) {
      this.router.navigateByUrl('/details/' + this.selectedEndowment.id);
      this.selectedEndowment = null;
    }
  }

  sendQuotation(): void {
    this.router.navigateByUrl('/quotation');
  }
}
