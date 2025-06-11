import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/components/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/components/shop.component').then(m => m.ShopComponent)
  },
  {
    path: 'sell',
    loadComponent: () => import('./features/sell/components/sell.component').then(m => m.SellComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/components/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'favourites',
    loadComponent: () => import('./features/favourites/components/favourites.component').then(m => m.FavouritesComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/components/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'user',
    loadComponent: () => import('./features/user/components/user.component').then(m => m.UserComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/components/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/terms/components/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./features/privacy/components/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'trust',
    loadComponent: () => import('./features/trust/components/trust.component').then(m => m.TrustComponent)
  },
  {
    path: 'designers',
    loadComponent: () => import('./features/designers/components/designers.component').then(m => m.DesignersComponent)
  }
];
