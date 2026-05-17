import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Whatsapp } from './whatsapp';

describe('Whatsapp', () => {
  let component: Whatsapp;
  let fixture: ComponentFixture<Whatsapp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Whatsapp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Whatsapp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
