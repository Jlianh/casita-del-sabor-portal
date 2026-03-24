import { Routes } from '@angular/router';
import { CatalogDetails } from './catalog/catalog-details/catalog-details';
import { CatalogQuotation } from './catalog/catalog-quotation/catalog-quotation';
import { Catalog } from './catalog/catalog-home/catalog';
import { Home } from './catalog/home';
import { Packaging } from './catalog/packaging/packaging';
import { Login } from './login/login';
import { StaffGuard } from './services/staff.guard';
import { AdminUsers } from './admin/admin';

export const routes: Routes = [
    { path: 'details/:id', component: CatalogDetails},
    { path: 'quotation', component: CatalogQuotation },
    { path: 'billing', component: CatalogQuotation, canActivate: [StaffGuard] },
    { path: 'catalog', component:Catalog},
    { path: 'home', component:Home},
    { path: 'packaging', component:Packaging},
    { path: 'login', component:Login},
    { path: 'admin', component:AdminUsers, canActivate: [StaffGuard] },
    { path: '', redirectTo: 'home', pathMatch: 'full'},
];
