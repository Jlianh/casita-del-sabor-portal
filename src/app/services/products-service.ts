import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import products from '../../assets/products/products.json';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private products = products;

  constructor(private http: HttpClient) { }

  GetProducts(): any[] {
    return this.products;
  }

  GetProductsById(id: number): any {
    return this.products.find(p => p.id === id);
  }

  GetProductsByCategories(): any[] {
    const categories = this.products.map(p => p.categoria);
    return [...new Set(categories)];
  }

  getProductsCategories(): any[] {
    return products.map(p => p.categoria);
  }

  GetProductsByFilter(category: string){
    return this.products.filter(p => p.categoria === category);
  }
  

}
