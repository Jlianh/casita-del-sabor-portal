import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products-service';

interface Category {
  key: string;
  label: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class Catalog implements OnInit {

  products: any[] = [];

  activeCategory = 'all';

  categories: Category[] = [
    { key: 'all',          label: 'Todos'        },
    { key: 'Frutos secos', label: 'Frutos Secos' },
    { key: 'Dulces',       label: 'Dulces'       },
    { key: 'Especias',     label: 'Especias'     },
    { key: 'Condimentos',  label: 'Condimentos'  },
    { key: 'Semillas',     label: 'Semillas'     },
  ];

  constructor(
    private router        : Router,
    private productService: ProductsService
  ) {}

  ngOnInit(): void {
    this.products = this.productService.GetProducts();
  }

  get filtered(): any[] {
    return this.products.filter(p =>
      this.activeCategory === 'all' || p.categoria === this.activeCategory
    );
  }

  endowmentDetails(id: number): void {
    this.router.navigate(['/details', id]);
  }
}