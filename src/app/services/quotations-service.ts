import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Quotation } from '../models/quotation';

@Injectable({
  providedIn: 'root'
})
export class QuotationsService {
  private apiUrl = 'https://casita-del-sabor-email-service.vercel.app/';

  // private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  SendQuotation(quotation: Quotation): Observable<any> {
    return this.http.post<any>(this.apiUrl + '/api/quotation', quotation);
  }

  SendBill(billRequest: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/quotation/bill`, billRequest);
}
}
