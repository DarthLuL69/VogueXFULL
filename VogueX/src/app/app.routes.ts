import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop.component').then(m => m.ShopComponent)
  },
  {
    path: 'sell',
    loadComponent: () => import('./features/sell/sell.component').then(m => m.SellComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'favourites',
    loadComponent: () => import('./features/favourites/favourites.component').then(m => m.FavouritesComponent)
  },
  {
    path: 'user',
    loadComponent: () => import('./features/user/user.component').then(m => m.UserComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/terms/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'trust',
    loadComponent: () => import('./features/trust/trust.component').then(m => m.TrustComponent)
  },
  {
    path: 'designers',
    loadComponent: () => import('./features/designers/designers.component').then(m => m.DesignersComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./components/product-details/product-details.component').then(m => m.ProductDetailsComponent)
  },
  {
    path: 'new-listing',
    loadComponent: () => import('./features/new-listing/new-listing.component').then(m => m.NewListingComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
