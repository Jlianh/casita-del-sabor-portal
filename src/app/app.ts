import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap'
import { Navbar } from "./components/navbar/navbar";
import { Footer } from "./components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [CommonModule, NgbCollapseModule, RouterModule, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  constructor() {}

  protected readonly title = signal('endowment-catalog-portal');

}
