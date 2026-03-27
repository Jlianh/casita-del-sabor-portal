import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart-service';
import { ProductsService } from '../../services/products-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './catalog-details.html',
  styleUrl: './catalog-details.css'
})
export class CatalogDetails implements OnInit, OnDestroy {

  endowmentDetail: any = null;
  endowmentId: number = 0;
  quantity: number[] = [];
  selectedPresentation: boolean[] = [];

  private routeSub?: Subscription;

  customSelected: boolean = false;
  customQuantity: number = 1;
  customGrams: number = 1;
  customUnits: number = 1;

  constructor(
    private cartService: CartService,
    private endowmentService: ProductsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(paramMap => {
      const idParam = paramMap.get('id');
      const id = idParam ? +idParam : null;

      if (id !== null) {
        this.endowmentId = id;
        this.endowmentDetail = this.endowmentService.GetProductsById(id);
        this.quantity = [];
        this.selectedPresentation = [];
        this.customSelected = false;
        this.customQuantity = 1;
        this.customGrams = 1;
        this.customUnits = 1;
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

  incrementCustom(): void {
    this.customQuantity++;
  }

  decrementCustom(): void {
    if (this.customQuantity > 1) this.customQuantity--;
  }

  addToCart(): void {
    const selectedItems = this.endowmentDetail.gramajes
      .map((gramaje: string, index: number) => {
        if (this.selectedPresentation[index]) {
          return {
            id: this.endowmentDetail.id,
            name: this.endowmentDetail.nombre,
            gramaje: this.endowmentDetail.gramajes[index].gramos + ' gramos ',
            quantity: this.quantity[index] || 1,
            image: this.endowmentDetail.imagen,
            index,
            barcode: this.endowmentDetail.gramajes[index].cod_barras,
          };
        }
        return null;
      })
      .filter((item: any) => item !== null && item.quantity > 0);

    if (this.customSelected && this.customQuantity > 0) {
      selectedItems.push({
        id: this.endowmentDetail.id,
        name: this.endowmentDetail.nombre,
        gramaje: `${this.customGrams} gramos x ${this.customUnits} unidades`,
        quantity: this.customQuantity || 1,
        image: this.endowmentDetail.imagen,
        index: 'custom',
        barcode: "Personalizado",
      });
    }

    if (selectedItems.length === 0) {
      alert('Por favor, seleccione al menos una presentación con cantidad mayor a 0.');
      return;
    }

    selectedItems.forEach((item: any) => this.cartService.addItem(item));
  }
}