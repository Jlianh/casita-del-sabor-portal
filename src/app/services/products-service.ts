import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = 'https://localhost:7094/';

  constructor(private http: HttpClient) { }

  GetEndowments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'api/Endowment');
  }

  GetEndowmentById(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'api/Endowment/GetById/' + id);
  }

  GetEndowmentTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'api/EndowmentType');
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'api/Category');
  }

  GetEndowmentsByFilter(categoryId: number | null, endowmentTypeId: number | null){
    if (categoryId === 0) {
      categoryId = null;
    }
    if (endowmentTypeId === 0) {
      endowmentTypeId = null;
    }
    const body = {
      categoryId: categoryId,
      endowmentTypeId: endowmentTypeId
    };
    return this.http.post<any[]>(this.apiUrl + 'api/Endowment/GetByFilters', body);
  }
  

}
