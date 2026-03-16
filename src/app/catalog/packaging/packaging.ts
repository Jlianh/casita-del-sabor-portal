import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
 
@Component({
  selector: 'app-packaging',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './packaging.html',
  styleUrl: './packaging.css'
})
export class Packaging implements AfterViewInit {
 
  constructor(private el: ElementRef) {}
 
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
 