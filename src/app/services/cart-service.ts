import { Injectable } from '@angular/core';
import { ProductsCart } from '../models/products-cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  constructor() { }

  private items: any[] = [];

  addItem(item: ProductsCart): void {
    const checkedItems = this.items.filter(i => i.id === item.id);

    if (checkedItems.length > 0) {
      checkedItems[0].quantity += item.quantity;
    } else {
      this.items.push(item);
    }
  }

  getItems(): ProductsCart[] {
    return this.items;
  }

}
