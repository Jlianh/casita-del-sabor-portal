import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Institutional } from './institutional';

describe('Institutional', () => {
  let component: Institutional;
  let fixture: ComponentFixture<Institutional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Institutional]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Institutional);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
