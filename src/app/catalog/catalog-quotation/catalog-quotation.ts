import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { ProductsCart } from '../../models/products-cart';
import { QuotationsService } from '../../services/quotations-service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-catalog-quotation',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, CurrencyPipe],
  templateUrl: './catalog-quotation.html',
  styleUrl: './catalog-quotation.css'
})
export class CatalogQuotation implements OnInit {

  // ── Client form ──────────────────────────────────────────────────────────
  clientQuotationForm = new FormGroup({
    clientName: new FormControl('', Validators.required),
    clientId: new FormControl('', Validators.required),
    clientAddress: new FormControl('', Validators.required),
    clientEmail: new FormControl('', [Validators.required, Validators.email]),
    clientPhone: new FormControl('', Validators.required),
    clientCity: new FormControl('', Validators.required),
  });

  // ── Per-item pricing (staff only) ────────────────────────────────────────
  // Controls: price_N, iva_N, discount_N, code_N   (N = item index)
  staffPricingForm = new FormGroup({});

  // ── Global retentions (staff only) ──────────────────────────────────────
  additionalInfoForm = new FormGroup({
    numeroRemision: new FormControl<number>(1, [Validators.min(1), Validators.required]),
    reteFuente: new FormControl<number>(0, [Validators.min(0), Validators.max(100)]),
    reteica: new FormControl<number>(0, [Validators.min(0), Validators.max(100)]),
  });

  constructor(
    public cartService: CartService,
    public quotationService: QuotationsService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    if (this.authService.isStaff()) {
      this.rebuildStaffPricing();
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Rebuild staffPricingForm controls to match current cart items. */
  private rebuildStaffPricing(): void {
    // Remove all existing controls first
    Object.keys(this.staffPricingForm.controls).forEach(k =>
      this.staffPricingForm.removeControl(k)
    );

    this.cartService.getItems().forEach((item, i) => {
      this.staffPricingForm.addControl(`price_${i}`, new FormControl<number>(item.price ?? 0, [Validators.required, Validators.min(0)]));
      this.staffPricingForm.addControl(`iva_${i}`, new FormControl<number>(19, [Validators.min(0), Validators.max(100)]));
      this.staffPricingForm.addControl(`discount_${i}`, new FormControl<number>(0, [Validators.min(0), Validators.max(100)]));
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.clientQuotationForm.get(field);
    return !!(ctrl?.invalid && (ctrl.touched || ctrl.dirty));
  }

  additionalInfoisInvalid(field: string): boolean {
    const ctrl = this.additionalInfoForm.get(field);
    return !!(ctrl?.invalid && (ctrl.touched || ctrl.dirty));
  }

  getTotalQuantity(): number {
    return this.cartService.getItems().reduce((t, item) => t + item.quantity, 0);
  }

  incrementQuantity(item: ProductsCart): void { item.quantity++; }

  decrementQuantity(item: ProductsCart): void {
    if (item.quantity > 1) item.quantity--;
  }

  removeItem(index: number): void {
    this.cartService.getItems().splice(index, 1);
    if (this.authService.isStaff()) this.rebuildStaffPricing();
  }

  // ── Staff billing calculations ────────────────────────────────────────────

  /** Returns the subtotal (price × qty + iva − discount) for a single item row. */
  getItemSubtotal(i: number): number {
    const price = Number(this.staffPricingForm.get(`price_${i}`)?.value);
    const qty = this.cartService.getItems()[i]?.quantity ?? 0;
    const ivaPct = this.normalizePct(this.staffPricingForm.get(`iva_${i}`)?.value ?? 0);
    const discPct = this.staffPricingForm.get(`discount_${i}`)?.value ?? 0;

    const base = price * qty;
    const ivaAmt = base * ivaPct;
    const subtotal = base + ivaAmt;
    const discAmt = subtotal * discPct / 100;
    return subtotal - discAmt;
  }

  /** Returns the IVA amount for a single item row. */
  getItemIvaValue(i: number): number {
    const price = Number(this.staffPricingForm.get(`price_${i}`)?.value);
    const qty = this.cartService.getItems()[i]?.quantity ?? 0;
    const ivaPct = this.normalizePct(this.staffPricingForm.get(`iva_${i}`)?.value ?? 0);

    const base = price * qty;
    const ivaAmt = base * ivaPct;
    return ivaAmt;
  }

  /** Returns the discount amount for a single item row. */
  getItemDiscountValue(i: number): number {
    const price = Number(this.staffPricingForm.get(`price_${i}`)?.value);
    const qty = this.cartService.getItems()[i]?.quantity ?? 0;
    const ivaPct = this.normalizePct(this.staffPricingForm.get(`iva_${i}`)?.value ?? 0);
    const discPct = this.staffPricingForm.get(`discount_${i}`)?.value ?? 0;

    const base = price * qty;
    const ivaAmt = base * ivaPct;
    const subtotal = base + ivaAmt;
    const discAmt = subtotal * discPct / 100;
    return discAmt;
  }


  /** Computes the full bill totals including retentions. Mirrors backend calculateBill(). */
  getBillTotals(): {
    subtotal: number; discount: number; totalIva: number;
    totalOperation: number; reteFuente: number;
    reteica: number; totalLessRetentions: number;
  } {
    const items = this.cartService.getItems();

    console.log(items);

    let subtotal = 0, discount = 0, totalIva = 0, totalOperation = 0;

    items.forEach((item, i) => {
      const price = Number(this.staffPricingForm.get(`price_${i}`)?.value ?? 0);
      const qty = item.quantity;
      const ivaPct = this.normalizePct(this.staffPricingForm.get(`iva_${i}`)?.value ?? 0);
      const discPct = this.normalizePct(this.staffPricingForm.get(`discount_${i}`)?.value ?? 0);


      const base = price * qty;
      const itemIva = base * ivaPct;
      const itemSubtotal = base + itemIva;
      const itemDiscount = itemSubtotal * discPct / 100;

      totalIva += itemIva;
      subtotal += itemSubtotal;
      discount += itemDiscount;
      totalOperation += itemSubtotal - itemDiscount;
    });

    console.log(subtotal, totalIva, discount, totalOperation);


    const reteFuentePct = this.normalizePct(this.additionalInfoForm.get('reteFuente')?.value ?? 0);
    const reteicaPct = this.normalizePct(this.additionalInfoForm .get('reteica')?.value ?? 0);

    const reteFuente = totalOperation * (reteFuentePct / 100);
    const reteica = totalOperation * (reteicaPct / 1000);

    const totalLessRetentions = totalOperation - (reteFuente + reteica);

    return {
      subtotal, discount, totalIva, totalOperation,
      reteFuente, reteica,
      totalLessRetentions,
    };
  }

  private normalizePct(value: number | null | undefined): number {
    if (value == null || isNaN(Number(value))) return 0;
    const n = Number(value);
    return n <= 1 ? n : n / 100;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  sendQuotation(): void {
    this.clientQuotationForm.markAllAsTouched();
    if (!this.clientQuotationForm.valid) return;

    const client = this.clientQuotationForm.value;
    const cartItems = this.cartService.getItems();
    const isStaff = this.authService.isStaff();

    if (isStaff) {
      // ── BILL (factura) path ──────────────────────────────────────────────
      const totals = this.getBillTotals();

      const billRequest = {
        remisionNumber: this.additionalInfoForm.get('numeroRemision')?.value ?? 1,
        clientName: client.clientName!,
        clientCity: client.clientCity!,
        clientId: client.clientId!,
        clientEmail: client.clientEmail!,
        clientAddress: client.clientAddress!,
        clientPhone: client.clientPhone!,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: this.authService.getUserDisplayName(),
        // Global retention percentages (raw — backend normalizePct handles it)
        reteFuente: this.additionalInfoForm .get('reteFuente')?.value ?? 0,
        reteica: this.additionalInfoForm .get('reteica')?.value ?? 0,
        billItems: cartItems.map((item, i) => ({
          id: item.id,
          code: item.barcode,
          name: item.name,
          grammage: item.gramaje,
          quantity: item.quantity,
          unitaryPrice: Number(this.staffPricingForm.get(`price_${i}`)?.value ?? 0),
          iva: Number(this.staffPricingForm.get(`iva_${i}`)?.value ?? 0),
          discount: Number(this.staffPricingForm.get(`discount_${i}`)?.value ?? 0),
          imageName: item.image,
        })),
      };

      this.quotationService.SendBill(billRequest).subscribe({
        next: response => {
          console.log('Bill sent successfully', response);
          alert('Factura generada y enviada con éxito.');
          this.cartService.getItems().length = 0;
          this.clientQuotationForm.reset();
          this.additionalInfoForm .reset({ reteFuente: 0, reteica: 0 });
          this.rebuildStaffPricing();
        },
        error: err => console.error('Error sending bill', err),
      });

    } else {
      // ── QUOTATION (cotización) path ──────────────────────────────────────
      const quotationRequest = {
        clientName: client.clientName!,
        clientId: client.clientId!,
        clientCity: client.clientCity!,
        clientEmail: client.clientEmail!,
        clientAddress: client.clientAddress!,
        clientPhone: client.clientPhone!,
        createdAt: new Date().toISOString().split('T')[0],
        role: 'customer',
        quotationItems: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          grammage: item.gramaje,
          quantity: item.quantity,
          imageName: item.image,
        })),
      };

      this.quotationService.SendQuotation(quotationRequest).subscribe({
        next: response => {
          console.log('Quotation sent successfully', response);
          alert('Cotización enviada con éxito.');
          this.cartService.getItems().length = 0;
          this.clientQuotationForm.reset();
        },
        error: err => console.error('Error sending quotation', err),
      });
    }
  }
}