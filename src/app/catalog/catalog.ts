import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProductsService } from '../services/products-service';
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

  endowments: any[] = [];

  categories: any[] = []; 

  endowmentTypes: any[] = [];

  constructor(private router: Router, private endowmentService: ProductsService) {}

  ngOnInit(): void {
    this.endowmentService.GetEndowments().subscribe(data => {
      this.endowments = data;
    });
    this.endowmentService.GetEndowmentTypes().subscribe(data => {
      this.endowmentTypes = data;
    });
    this.endowmentService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  endowmentDetails(id: number): void {
    this.router.navigate(['/details', id]);
  }

  async getFilters(){
    this.endowmentService.GetEndowmentsByFilter(Number(this.filtersForm.value.categoriesId), Number(this.filtersForm.value.endowmentTypeId)
    ).subscribe(data => {
      this.endowments = data 
    });
  }


}
