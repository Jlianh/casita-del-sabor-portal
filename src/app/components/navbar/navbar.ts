import { Component, ViewChild, viewChild } from '@angular/core';
import { CartService } from '../../services/cart-service';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { ProductsService } from '../../services/products-service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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

  selectedEndowment: any;

  endowments: any[] = [];

  ngOnInit(): void {
    this.productService.GetEndowments().subscribe(data => {
      this.endowments.push(...data);
    });

    console.log(this.endowments);
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
  }

  removeItem(index: number): void {
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
      // this.router.navigate(['/details', this.selectedEndowment.id]);
      this.router.navigateByUrl('/details/' + this.selectedEndowment.id);
      this.selectedEndowment = null;
    }
  }

  sendQuotation(): void {
    console.log('Hi');
    const items = this.cartService.getItems();
    console.log('Sending quotation for items:', items);
  }
}
