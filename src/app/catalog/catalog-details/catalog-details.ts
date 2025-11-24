import { Component } from '@angular/core';
import { CartService } from '../../services/cart-service';
import { ProductsService } from '../../services/products-service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-catalog-details',
  imports: [RouterModule],
  standalone: true,
  templateUrl: './catalog-details.html',
  styleUrl: './catalog-details.css'
})
export class CatalogDetails {

  endowmentDetail: any;

  endowmentId: number = 0;

  constructor(private cartService: CartService, private endowmentService: ProductsService, private router: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.params.subscribe(params => {
      this.endowmentId = params['id'];
    });

    this.endowmentDetail = this.endowmentService.GetEndowmentById(this.endowmentId).subscribe(data => {
      this.endowmentDetail = data;
      console.log(this.endowmentDetail);
    });
  }

  quantity: number = 1;

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    console.log('Adding to cart:', this.quantity);
    this.cartService.addItem({
      id: 274,
      name: 'Endowment 274',
      quantity: this.quantity
    });
    console.log('Added to cart:', this.quantity);
  }

}
