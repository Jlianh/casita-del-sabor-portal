import { Routes } from '@angular/router';
import { CatalogDetails } from './catalog/catalog-details/catalog-details';
import { CatalogQuotation } from './catalog/catalog-quotation/catalog-quotation';
import { Catalog } from './catalog/catalog';

export const routes: Routes = [
    { path: 'details/:id', component: CatalogDetails},
    { path: 'quotation', component: CatalogQuotation},
    { path: 'home', component:Catalog},
    { path: '', redirectTo: 'home', pathMatch: 'full'},
];
