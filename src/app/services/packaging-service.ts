import { Injectable } from '@angular/core';
import packaging from '../../assets/products/packaging.json';

@Injectable({
  providedIn: 'root'
})
export class PackagingService {

  private packaging = packaging;

  GetPackaging(): any[] {
    return this.packaging;
  }
  
}
