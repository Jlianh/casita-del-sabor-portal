import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'
import { Navbar } from "./components/navbar/navbar";
import { Footer } from "./components/footer/footer";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, NgbCollapseModule, RouterModule, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  protected readonly title = signal('endowment-catalog-portal');

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check session on app init to refresh user data from backend
    this.authService.checkSession().subscribe({
      error: () => {
        // Session expired or no valid token, user remains logged out
      }
    });
  }

}
