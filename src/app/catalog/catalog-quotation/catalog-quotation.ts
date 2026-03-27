import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart-service';
import { ProductsCart } from '../../models/products-cart';
import { QuotationsService } from '../../services/quotations-service';
import { AuthService } from '../../services/auth.service';

import departamentsInfo from '../../../assets/products/colombia.json'

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
  });

  private allDepts: Departamento[] = departamentsInfo as Departamento[];

  // ── Per-item pricing (staff only) ────────────────────────────────────────
  // Controls: price_N, iva_N, discount_N, code_N   (N = item index)
  staffPricingForm = new FormGroup({});

  // ── Global retentions (staff only) ──────────────────────────────────────
  additionalInfoForm = new FormGroup({
    numeroRemision: new FormControl<number>(0, [Validators.min(1), Validators.required]),
    numeroReciboCaja: new FormControl<number>(0, [Validators.min(1), Validators.required]),
    formaPago: new FormControl<string>('', [Validators.required]),
    descuentoComercial: new FormControl<number>(0, [Validators.min(1)])
  });

  locationForm = new FormGroup({
    clientDepartamento: new FormControl('', Validators.required),
    clientCiudad: new FormControl('', Validators.required),
  });


  // ── Departamento state ────────────────────────────────────────────────────
  deptQuery = '';
  deptFocused = false;
  deptActiveIdx = -1;
  filteredDepts: Departamento[] = [];
  selectedDept: Departamento | null = null;

  // ── Ciudad state ──────────────────────────────────────────────────────────
  cityQuery = '';
  cityFocused = false;
  cityActiveIdx = -1;
  filteredCities: string[] = [];

  constructor(
    public cartService: CartService,
    public quotationService: QuotationsService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    if (this.authService.isStaff()) {
      this.rebuildStaffPricing();
    }
    this.filteredDepts = this.allDepts;
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

  isInvalidLoc(field: string): boolean {
    const ctrl = this.locationForm.get(field);
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
    const discPct = this.staffPricingForm.get(`discount_${i}`)?.value ?? 0;

    const base = price * qty;
    const discAmt = base * discPct / 100;
    const subtotal = base - discAmt;
    return subtotal;
  }

  /** Returns the IVA amount for a single item row. */
  getItemIvaValue(i: number): number {
    const price = Number(this.staffPricingForm.get(`price_${i}`)?.value);
    const qty = this.cartService.getItems()[i]?.quantity ?? 0;

    const base = price * qty;
    const ivaAmt = base * 0.19;
    return ivaAmt;
  }

  /** Returns the discount amount for a single item row. */
  getItemDiscountValue(i: number): number {
    const price = Number(this.staffPricingForm.get(`price_${i}`)?.value);
    const qty = this.cartService.getItems()[i]?.quantity ?? 0;
    const discPct = this.staffPricingForm.get(`discount_${i}`)?.value ?? 0;

    const base = price * qty;
    const discAmt = base * discPct / 100;
    return discAmt;
  }


  /** Computes the full bill totals including retentions. Mirrors backend calculateBill(). */
  getBillTotals(): {
    subtotal: number;
    discount: number;
    totalIva: number;
    totalOperation: number;
  } {
    const items = this.cartService.getItems();

    let subtotal = 0;
    let discount = 0;

    const comercialPct = this.additionalInfoForm.get('descuentoComercial')?.value ?? 0
   

    items.forEach((item, i) => {
      const price = Number(this.staffPricingForm.get(`price_${i}`)?.value ?? 0);
      const qty = item.quantity;
      const discPct = this.normalizePct(
        this.staffPricingForm.get(`discount_${i}`)?.value ?? 0
      );

      const base = price * qty;
      const itemDiscount = base * discPct / 100;
      const itemSubtotal = base - itemDiscount;

      subtotal += itemSubtotal;
      discount += itemDiscount;
    });

    subtotal = subtotal - comercialPct;

    // 🔹 IVA SOLO UNA VEZ
    const totalIva = subtotal * 0.19;

    const totalOperation = subtotal + totalIva;

    return {
      subtotal,
      discount,
      totalIva,
      totalOperation,
    };
  }

  private normalizePct(value: number | null | undefined): number {
    if (value == null || isNaN(Number(value))) return 0;
    const n = Number(value);
    return n <= 1 ? n : n / 100;
  }

  // ═══════════════════════════════════════════════════════════════
  // DEPARTAMENTO
  // ═══════════════════════════════════════════════════════════════

  onDeptInput(event: Event): void {
    this.deptQuery = (event.target as HTMLInputElement).value;
    this.deptActiveIdx = -1;

    // Clear selection if user edits after picking
    if (this.selectedDept) {
      this.selectedDept = null;
      this.locationForm.patchValue({ clientDepartamento: '', clientCiudad: '' });
      this.clearCity();
    }

    this.filteredDepts = this.normalize(this.deptQuery)
      ? this.allDepts.filter(d =>
        this.normalize(d.departamento).includes(this.normalize(this.deptQuery))
      )
      : this.allDepts;
  }

  onDeptBlur(): void {
    // Delay so mousedown on option fires first
    setTimeout(() => {
      this.deptFocused = false;
      // If user typed something but didn't pick, revert to selected or clear
      if (!this.selectedDept) {
        this.deptQuery = '';
        this.locationForm.patchValue({ clientDepartamento: '' });
        this.locationForm.get('clientDepartamento')?.markAsTouched();
      } else {
        this.deptQuery = this.selectedDept.departamento;
      }
    }, 150);
  }

  onDeptKey(event: KeyboardEvent): void {
    if (!this.filteredDepts.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.deptActiveIdx = Math.min(this.deptActiveIdx + 1, this.filteredDepts.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.deptActiveIdx = Math.max(this.deptActiveIdx - 1, 0);
    } else if (event.key === 'Enter' && this.deptActiveIdx >= 0) {
      event.preventDefault();
      this.selectDept(this.filteredDepts[this.deptActiveIdx]);
    } else if (event.key === 'Escape') {
      this.deptFocused = false;
    }
  }

  selectDept(dept: Departamento): void {
    this.selectedDept = dept;
    this.deptQuery = dept.departamento;
    this.deptFocused = false;
    this.deptActiveIdx = -1;
    this.locationForm.patchValue({ clientDepartamento: dept.departamento });

    // Reset city when department changes
    this.clearCity();
    this.filteredCities = dept.ciudades;
  }

  clearDept(): void {
    this.deptQuery = '';
    this.selectedDept = null;
    this.filteredDepts = this.allDepts;
    this.locationForm.patchValue({ clientDepartamento: '', clientCiudad: '' });
    this.clearCity();
  }

  // ═══════════════════════════════════════════════════════════════
  // CIUDAD
  // ═══════════════════════════════════════════════════════════════

  onCityInput(event: Event): void {
    this.cityQuery = (event.target as HTMLInputElement).value;
    this.cityActiveIdx = -1;
    this.locationForm.patchValue({ clientCiudad: '' }); // clear until confirmed

    const cities = this.selectedDept?.ciudades ?? [];
    this.filteredCities = this.normalize(this.cityQuery)
      ? cities.filter(c =>
        this.normalize(c).includes(this.normalize(this.cityQuery))
      )
      : cities;
  }

  onCityBlur(): void {
    setTimeout(() => {
      this.cityFocused = false;
      // If city value not set (user typed but didn't pick), revert
      if (!this.locationForm.get('clientCiudad')?.value) {
        this.cityQuery = '';
        this.locationForm.get('clientCiudad')?.markAsTouched();
      }
    }, 150);
  }

  onCityKey(event: KeyboardEvent): void {
    if (!this.filteredCities.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.cityActiveIdx = Math.min(this.cityActiveIdx + 1, this.filteredCities.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.cityActiveIdx = Math.max(this.cityActiveIdx - 1, 0);
    } else if (event.key === 'Enter' && this.cityActiveIdx >= 0) {
      event.preventDefault();
      this.selectCity(this.filteredCities[this.cityActiveIdx]);
    } else if (event.key === 'Escape') {
      this.cityFocused = false;
    }
  }

  selectCity(city: string): void {
    this.cityQuery = city;
    this.cityFocused = false;
    this.cityActiveIdx = -1;
    this.locationForm.patchValue({ clientCiudad: city });
  }

  clearCity(): void {
    this.cityQuery = '';
    this.cityActiveIdx = -1;
    this.filteredCities = this.selectedDept?.ciudades ?? [];
    this.locationForm.patchValue({ clientCiudad: '' });
  }

  // ── Normalize for accent-insensitive search ───────────────────────────────
  private normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // strips accents: é→e, ñ→n, etc.
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  sendQuotation(): void {
   
    this.validateForms();

    const client = this.clientQuotationForm.value;
    const cartItems = this.cartService.getItems();
    const isStaff = this.authService.isStaff();

    if (isStaff) {
      
      const billRequest = {
        remisionNumber: this.additionalInfoForm.get('numeroRemision')?.value,
        cashReceipt: this.additionalInfoForm.get('numeroReciboCaja')?.value,
        paymentMethod: this.additionalInfoForm.get('formaPago')?.value,
        comercialDiscount: this.additionalInfoForm.get('descuentoComercial')?.value,
        clientName: client.clientName!,
        clientCity: this.locationForm.get('clientCiudad')?.value,
        clientId: client.clientId!,
        clientEmail: client.clientEmail!,
        clientAddress: client.clientAddress!,
        clientPhone: client.clientPhone!,
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: this.authService.getUserDisplayName(),
        // Global retention percentages (raw — backend normalizePct handles it)
        billItems: cartItems.map((item, i) => ({
          id: item.id,
          code: item.barcode,
          name: item.name,
          grammage: item.gramaje,
          quantity: item.quantity,
          unitaryPrice: Number(this.staffPricingForm.get(`price_${i}`)?.value ?? 0),
          iva: 19,
          discount: Number(this.staffPricingForm.get(`discount_${i}`)?.value ?? 0),
        })),
      };

      this.quotationService.SendBill(billRequest).subscribe({
        next: response => {
          console.log('Bill sent successfully', response);
          alert('Factura generada y enviada con éxito.');
          this.cartService.getItems().length = 0;
          this.clientQuotationForm.reset();
          this.rebuildStaffPricing();
        },
        error: err => console.error('Error sending bill', err),
      });

    } else {
      // ── QUOTATION (cotización) path ──────────────────────────────────────
      const quotationRequest = {
        clientName: client.clientName!,
        clientId: client.clientId!,
        clientCity: this.locationForm.get('clientCiudad')?.value?.toString(),
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
  validateForms(){
    this.additionalInfoForm.markAllAsTouched
    this.locationForm.markAllAsTouched
    this.clientQuotationForm.markAllAsTouched
    if(!this.additionalInfoForm.valid) return;
    if(!this.locationForm.valid) return;
    if(!this.clientQuotationForm) return;
  }
}

