import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginService } from './login-service';

export interface AppUser {
    id?: string;
    email?: string;
    user?: string;
    name?: string;
    role?: 'staff' | 'admin' | 'customer' | string;
    roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    // private apiUrl = 'http://localhost:3000/api/auth';

    private apiUrl = 'https://casita-del-sabor-email-service.vercel.app/api/auth';

    constructor(private loginService: LoginService, private http: HttpClient) {
        const cached = localStorage.getItem('currentUser');
        if (cached) {
            const parsed = JSON.parse(cached);
            const normalized: AppUser = {
                ...parsed,
                email: parsed.user || parsed.email,
                roles: parsed.roles ?? (parsed.role ? [parsed.role] : []),
            };
            this.currentUserSubject.next(normalized);
            localStorage.setItem('currentUser', JSON.stringify(normalized));
        }
    }


    getUserDisplayName(): string {
        const user = this.currentUser;

        if (!user) return 'N/A';

        return user.name
            || user.user
            || user.email
            || 'N/A';
    }

    get currentUser(): AppUser | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return !!this.currentUser;
    }

    isStaff(): boolean {
        const roles = this.currentUser?.roles || [];
        return roles.includes('vendedor') || roles.includes('administrador');
    }

    isAdmin(): boolean {
        const roles = this.currentUser?.roles || [];
        return roles.includes('administrador');
    }

    login(email: string, password: string): Observable<any> {
        return this.loginService.login(email, password).pipe(
            tap((res: any) => {
                if (!res) return;

                const src = res.user ?? res;
                const normalized: AppUser = {
                    ...src,
                    email: src.user || src.email,
                    roles: src.roles ?? (src.role ? [src.role] : []),
                };

                this.currentUserSubject.next(normalized);
                localStorage.setItem('currentUser', JSON.stringify(normalized));
            })
        );
    }

    logout(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.currentUserSubject.next(null);
                localStorage.removeItem('currentUser');
            })
        );
    }

    checkSession(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
            tap((res) => {
                const src = res?.user ?? res;
                if (src) {
                    const normalized: AppUser = {
                        ...src,
                        email: src.user || src.email,
                        roles: src.roles ?? (src.role ? [src.role] : []),
                    };
                    this.currentUserSubject.next(normalized);
                    localStorage.setItem('currentUser', JSON.stringify(normalized));
                }
            })
        );
    }

    createUser(data: any) {
        return this.http.post(`${this.apiUrl}/users`, data, {
            withCredentials: true
        });
    }

    deleteUser(id: any) {
        return this.http.delete(`${this.apiUrl}/users/${id}`, {
            withCredentials: true
        });
    }

    getUsers() {
        return this.http.get(`${this.apiUrl}/users`, {
            withCredentials: true
        });
    }
}
