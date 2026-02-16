import { Routes } from '@angular/router';
import { CatalogDetails } from './catalog/catalog-details/catalog-details';
import { CatalogQuotation } from './catalog/catalog-quotation/catalog-quotation';
import { Catalog } from './catalog/catalog-home/catalog';
import { Home } from './catalog/home';


export const routes: Routes = [
    { path: 'details/:id', component: CatalogDetails},
    { path: 'quotation', component: CatalogQuotation},
    { path: 'catalog', component:Catalog},
    { path: 'home', component:Home},
    { path: '', redirectTo: 'home', pathMatch: 'full'},
];
