import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

    // private apiUrl = 'http://localhost:3000/api/auth/login';

    private apiUrl = 'https://casita-del-sabor-auth-service.vercel.app/api/auth/login';

    constructor(private http: HttpClient) { }

    login(user: string | undefined | null, password: string) {
        return this.http.post(this.apiUrl, { user, password }, { withCredentials: true });
    }
}
