import { Injectable } from '@angular/core';
import { ProductsCart } from '../models/products-cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly CART_STORAGE_KEY = 'cart_items';
  private items: ProductsCart[] = [];

  constructor() {
    this.loadCartFromStorage();
  }

  private saveCartToStorage(): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.items = [];
    }
  }

  addItem(item: ProductsCart): void {
    const checkedItems = this.items.filter(i => i.id === item.id && i.index === item.index);

    if (checkedItems.length > 0) {
      checkedItems[0].quantity += item.quantity;
    } else {
      this.items.push(item);
    }

    this.saveCartToStorage();
  }

  getItems(): ProductsCart[] {
    return this.items;
  }

  clearCart(): void {
    this.items = [];
    this.saveCartToStorage();
  }

  removeItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.saveCartToStorage();
    }
  }

  updateItemQuantity(index: number, quantity: number): void {
    if (index >= 0 && index < this.items.length && quantity > 0) {
      this.items[index].quantity = quantity;
      this.saveCartToStorage();
    }
  }
}
