import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Packaging } from './packaging';

describe('Packaging', () => {
  let component: Packaging;
  let fixture: ComponentFixture<Packaging>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Packaging]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Packaging);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
