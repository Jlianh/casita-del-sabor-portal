import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogQuotation } from './catalog-quotation';

describe('CatalogQuotation', () => {
  let component: CatalogQuotation;
  let fixture: ComponentFixture<CatalogQuotation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogQuotation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogQuotation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
