import { Component, AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PackagingService } from '../../services/packaging-service';
 
@Component({
  selector: 'app-packaging',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './packaging.html',
  styleUrl: './packaging.css'
})
export class Packaging implements AfterViewInit, OnInit {

  packaging: any[] = [];
 
  constructor(private el: ElementRef, private packagingService: PackagingService) {}

  ngOnInit(): void {
    this.packaging = this.packagingService.GetPackaging();
  }
 
  ngAfterViewInit(): void {
    const targets = this.el.nativeElement.querySelectorAll('.scroll-reveal');
 
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
 
    targets.forEach((el: Element) => observer.observe(el));
  }
}
 