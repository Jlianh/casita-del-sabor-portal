import { Component } from '@angular/core';
import { CartService } from '../../services/cart-service';
import { ProductsCart } from '../../models/products-cart';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuotationsService } from '../../services/quotations-service';

@Component({
  selector: 'app-catalog-quotation',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './catalog-quotation.html',
  styleUrl: './catalog-quotation.css'
})
export class CatalogQuotation {

  clientQuotationForm = new FormGroup({
    clientName: new FormControl('', Validators.required),
    clientCompany: new FormControl(''),
    clientEmail: new FormControl('', [Validators.required, Validators.email]),
    clientPhone: new FormControl('' , Validators.required),
    clientAddress: new FormControl('')
  });

  constructor(public cartService: CartService,
     public quotationService: QuotationsService) { 
      
     }

  removeItem(index: number): void {
    console.log('Removing item at index:', index);
    this.cartService.getItems().splice(index, 1);
  }

  getTotalQuantity(): number {
    return this.cartService.getItems().reduce((total, item) => total + item.quantity, 0);
  }

  incrementQuantity(item: ProductsCart): void {
    item.quantity++;
  }

  decrementQuantity(item: ProductsCart): void {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  sendQuotation(): void {
    if (this.clientQuotationForm.valid) {
      const clientInfo = this.clientQuotationForm.value;
      const cartItems = this.cartService.getItems();
      const quotationRequest = {
        clientName: clientInfo.clientName!,
        clientCompany: clientInfo.clientCompany!,
        clientEmail: clientInfo.clientEmail!,
        clientAddress: clientInfo.clientAddress!,
        clientPhone: clientInfo.clientPhone!,
        createdAt: new Date().toISOString().split('T')[0],
        quotationItems: cartItems.map(item => ({
          endowmentId: item.id,
          quantity: item.quantity,
          imageName: item.image
        }))
      };

      this.quotationService.SendQuotation(quotationRequest).subscribe({
        next: response => {
          console.log('Quotation sent successfully', response); 
          alert('Cotización enviada con éxito.');
          this.cartService.getItems().length = 0;
          this.clientQuotationForm.reset();
        },
        error: err => {
          console.error('Error sending quotation', err);
        }
      });   
      console.log('Quotation Request:', cartItems);
    }
  }

}
