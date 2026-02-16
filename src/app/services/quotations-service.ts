import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Quotation } from '../models/quotation';

@Injectable({
  providedIn: 'root'
})
export class QuotationsService {
  private apiUrl = 'https://localhost:7094/';

  constructor(private http: HttpClient) { }

  SendQuotation(quotation: Quotation): Observable<any> {
    return this.http.post<any>(this.apiUrl + 'api/Quotation', quotation);
  }
}
