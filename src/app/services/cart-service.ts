import { Injectable } from '@angular/core';
import { ProductsCart } from '../models/products-cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  constructor() { }

  private items: any[] = [];

  addItem(item: ProductsCart): void {
    this.items.push(item);
  }

  getItems(): ProductsCart[] {
    return this.items;
  }

}
