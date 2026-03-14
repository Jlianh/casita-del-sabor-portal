import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart-service';
import { ProductsService } from '../../services/products-service';

@Component({
  selector: 'app-catalog-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './catalog-details.html',
  styleUrl: './catalog-details.css'
})
export class CatalogDetails implements OnInit, OnDestroy {

  endowmentDetail: any = null;
  endowmentId: number = 0;
  quantity: number[] = [];
  selectedPresentation: boolean[] = [];

  private routeSub?: Subscription;

  constructor(
    private cartService     : CartService,
    private endowmentService: ProductsService,
    private route           : ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(paramMap => {
      const idParam = paramMap.get('id');
      const id = idParam ? +idParam : null;

      if (id !== null) {
        this.endowmentId      = id;
        this.endowmentDetail  = this.endowmentService.GetProductsById(id);
        this.quantity             = [];
        this.selectedPresentation = [];
      } else {
        this.endowmentDetail = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  selectPresentation(index: number): void {
    this.selectedPresentation[index] = !this.selectedPresentation[index];
    if (this.selectedPresentation[index] && !this.quantity[index]) {
      this.quantity[index] = 1;
    }
  }

  incrementQuantity(index: number): void {
    this.quantity[index] = (this.quantity[index] || 1) + 1;
  }

  decrementQuantity(index: number): void {
    if ((this.quantity[index] || 1) > 1) {
      this.quantity[index]--;
    }
  }

  changeQuantity(event: any, index: number): void {
    const val = parseInt(event.target.value, 10);
    this.quantity[index] = isNaN(val) || val < 1 ? 1 : val;
  }

  addToCart(): void {
    const selectedItems = this.endowmentDetail.gramajes
      .map((gramaje: string, index: number) => {
        if (this.selectedPresentation[index]) {
          return {
            id      : this.endowmentDetail.id,
            name    : this.endowmentDetail.nombre,
            gramaje,
            quantity: this.quantity[index] || 1,
            image   : this.endowmentDetail.imagen,
            index
          };
        }
        return null;
      })
      .filter((item: any) => item !== null && item.quantity > 0);

    if (selectedItems.length === 0) {
      alert('Por favor, seleccione al menos una presentación con cantidad mayor a 0.');
      return;
    }

    selectedItems.forEach((item: any) => this.cartService.addItem(item));
  }
}