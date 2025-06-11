import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class SellComponent implements OnInit {
  productForm: FormGroup;
  categories: any[] = [];
  selectedCategory: any;
  imagePreviews: string[] = [];
  selectedFiles: File[] = [];
  
  // Tallas disponibles según el tipo
  numericSizes = ['36', '38', '40', '42', '44', '46', '48', '50', '52'];
  standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

  // Control de imágenes requeridas
  hasFrontImage = false;
  hasBackImage = false;
  hasTagImage = false;
  hasBottomImage = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      category_id: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      condition: ['', Validators.required],
      size: ['', Validators.required],
      description: ['', Validators.required],
      damages: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
    
    // Suscribirse a cambios en la categoría para actualizar las tallas
    this.productForm.get('category_id')?.valueChanges.subscribe(categoryId => {
      this.selectedCategory = this.categories.find(c => c.id === categoryId);
      this.productForm.get('size')?.setValue('');
    });
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  onImageSelect(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (this.imagePreviews.length >= 6) break;
        
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
          this.selectedFiles.push(file);
        };
        
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
    this.updateImageRequirements();
  }

  updateImageRequirements() {
    // Aquí implementarías la lógica para detectar qué tipo de imagen es cada una
    // Por ahora, asumimos que las imágenes se suben en orden
    this.hasFrontImage = this.imagePreviews.length > 0;
    this.hasBackImage = this.imagePreviews.length > 1;
    this.hasTagImage = this.imagePreviews.length > 2;
    this.hasBottomImage = this.imagePreviews.length > 3;
  }

  isImageRequirementsMet(): boolean {
    return this.imagePreviews.length >= 6 &&
           this.hasFrontImage &&
           this.hasBackImage &&
           this.hasTagImage &&
           this.hasBottomImage;
  }

  cancelForm() {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los datos ingresados.')) {
      this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.productForm.valid && this.isImageRequirementsMet()) {
      const formData = new FormData();
      
      // Agregar datos del formulario
      Object.keys(this.productForm.value).forEach(key => {
        if (key !== 'images') {
          formData.append(key, this.productForm.value[key]);
        }
      });
      
      // Agregar imágenes
      this.selectedFiles.forEach((file, index) => {
        formData.append(`images[${index}]`, file);
      });
      
      try {
        const response = await this.apiService.createProduct(formData).toPromise();
        this.router.navigate(['/profile']);
      } catch (error) {
        console.error('Error al crear el producto:', error);
      }
    } else {
      this.productForm.markAllAsTouched();
    }
  }
}
