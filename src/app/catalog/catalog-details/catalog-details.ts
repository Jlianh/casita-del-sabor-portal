import { Component } from '@angular/core';
import { CartService } from '../../services/cart-service';
import { ProductsService } from '../../services/products-service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SizeService } from '../../services/size-service';
import { ColorService } from '../../services/color-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalog-details',
  imports: [RouterModule, CommonModule],
  standalone: true,
  templateUrl: './catalog-details.html',
  styleUrl: './catalog-details.css'
})
export class CatalogDetails {

  endowmentDetail: any;

  sizes : any[] = [];

  colors : any[] = [];

  endowmentId: number = 0;

  quantity: number = 1;

  constructor(private cartService: CartService,
     private endowmentService: ProductsService,
     private route: ActivatedRoute,
    private sizeService: SizeService,
  private colorService: ColorService) { }

  ngOnInit(): void {
    // Suscribirse a cambios de parámetros y cargar el detalle cada vez que cambie el id
    this.route.paramMap.subscribe(paramMap => {
      const idParam = paramMap.get('id');
      const id = idParam ? +idParam : null;

      if (id !== null) {
        this.endowmentId = id;

        // Llamada al servicio por cada cambio de id
        this.endowmentDetail = this.endowmentService.GetProductsById(id);
        this.quantity = 1; // Reiniciar cantidad al cambiar de producto
      } else {
        // Si no hay id, limpiar detalle
        this.endowmentDetail = null;
      }
    });
    console.log(this.endowmentDetail);
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    console.log('Adding to cart:', this.endowmentDetail);

    this.cartService.addItem({
      id: this.endowmentDetail.id,
      name: this.endowmentDetail.nombre,
      quantity: this.quantity,
      unitaryPrice: this.endowmentDetail.precio,
      totalPrice: this.endowmentDetail.precio * this.quantity,
      image: this.endowmentDetail.imagen
    });
    console.log({
      id: this.endowmentDetail.id,
      name: this.endowmentDetail.name,
      quantity: this.quantity,
      unitaryPrice: this.endowmentDetail.price,
      totalPrice: this.endowmentDetail.price * this.quantity,
      image: this.endowmentDetail.image
    });
  }

}
