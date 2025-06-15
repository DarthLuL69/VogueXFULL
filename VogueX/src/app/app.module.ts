import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductSearchComponent } from './components/product-search/product-search.component';
import { ContactComponent } from './components/contact/contact.component';
// Removed unused import

@NgModule({
  declarations: [
    AppComponent,
    ProductSearchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    ContactComponent
  ],  providers: [
    // No HTTP interceptors, they're now provided in app.config.ts
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 