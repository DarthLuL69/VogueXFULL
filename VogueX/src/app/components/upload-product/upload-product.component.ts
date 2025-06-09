import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-upload-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-product.component.html',
  styleUrls: ['./upload-product.component.scss']
})
export class UploadProductComponent implements OnInit {
  categories: any[] = [];
  product = {
    name: '',
    description: '',
    price: 0,
    category_id: null,
    images: [] as File[]
  };
  previewImages: string[] = [];
  error = '';
  success = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        this.error = 'Error al cargar las categorías';
        console.error('Error:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files.length < 5) {
      this.error = 'Debes seleccionar al menos 5 imágenes';
      return;
    }

    this.product.images = Array.from(files);
    this.previewImages = [];

    // Crear previsualizaciones
    this.product.images.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImages.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    this.error = '';
  }

  onSubmit(): void {
    if (this.validateForm()) {
      const formData = new FormData();
      formData.append('name', this.product.name);
      formData.append('description', this.product.description);
      formData.append('price', this.product.price.toString());
      formData.append('category_id', this.product.category_id!.toString());
      
      // Agregar cada imagen al FormData
      this.product.images.forEach((image, index) => {
        formData.append(`images[]`, image);
      });

      this.apiService.createProduct(formData).subscribe({
        next: (response) => {
          this.success = 'Producto creado exitosamente';
          setTimeout(() => {
            this.router.navigate(['/shop']);
          }, 2000);
        },
        error: (error) => {
          this.error = 'Error al crear el producto';
          console.error('Error:', error);
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.product.name || !this.product.description || !this.product.price || !this.product.category_id) {
      this.error = 'Por favor complete todos los campos requeridos';
      return false;
    }
    if (this.product.images.length < 5) {
      this.error = 'Debes seleccionar al menos 5 imágenes';
      return false;
    }
    return true;
  }
} 