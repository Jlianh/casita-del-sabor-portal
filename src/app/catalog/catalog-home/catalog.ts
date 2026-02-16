import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProductsService } from '../../services/products-service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})


export class Catalog {

  filtersForm = new FormGroup({
    categoriesId: new FormControl(''),
    endowmentTypeId: new FormControl('')
  });

  products: any[] = [];

  categories: any[] = []; 

  constructor(private router: Router, private productService: ProductsService) {}

  ngOnInit(): void {
    this.products = this.productService.GetProducts();
    console.log(this.products);
  }

  endowmentDetails(id: number): void {
    this.router.navigate(['/details', id]);
  }

}
