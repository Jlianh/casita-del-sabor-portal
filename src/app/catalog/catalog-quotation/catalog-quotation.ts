import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { ProductsCart } from '../../models/products-cart';
import { QuotationsService } from '../../services/quotations-service';

@Component({
  selector: 'app-catalog-quotation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './catalog-quotation.html',
  styleUrl: './catalog-quotation.css'
})
export class CatalogQuotation {

  clientQuotationForm = new FormGroup({
    clientName   : new FormControl('', Validators.required),
    clientCompany: new FormControl(''),
    clientAddress: new FormControl(''),
    clientEmail  : new FormControl('', [Validators.required, Validators.email]),
    clientPhone  : new FormControl('', Validators.required),
  });

  constructor(
    public cartService     : CartService,
    public quotationService: QuotationsService
  ) {}

  /** Helper used by the template to check field validity */
  isInvalid(field: string): boolean {
    const control = this.clientQuotationForm.get(field);
    return !!(control?.invalid && (control.touched || control.dirty));
  }

  getTotalQuantity(): number {
    return this.cartService.getItems().reduce((total, item) => total + item.quantity, 0);
  }

  incrementQuantity(item: ProductsCart): void {
    item.quantity++;
  }

  decrementQuantity(item: ProductsCart): void {
    if (item.quantity > 1) item.quantity--;
  }

  removeItem(index: number): void {
    this.cartService.getItems().splice(index, 1);
  }

  sendQuotation(): void {
    this.clientQuotationForm.markAllAsTouched();

    if (!this.clientQuotationForm.valid) return;

    const clientInfo  = this.clientQuotationForm.value;
    const cartItems   = this.cartService.getItems();

    const quotationRequest = {
      clientName   : clientInfo.clientName!,
      clientCompany: clientInfo.clientCompany!,
      clientEmail  : clientInfo.clientEmail!,
      clientAddress: clientInfo.clientAddress!,
      clientPhone  : clientInfo.clientPhone!,
      createdAt    : new Date().toISOString().split('T')[0],
      quotationItems: cartItems.map(item => ({
        productId: item.id,
        name      : item.name,
        grammage   : item.gramaje,
        quantity   : item.quantity,
        imageName  : item.image,
      })),
    };

    console.log('Sending quotation request:', quotationRequest);

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
  }
}