import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SizeService {

  private apiUrl = 'https://localhost:7094/';

  constructor(private http: HttpClient) { }

  GetSizes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'api/Size');
  }
}
