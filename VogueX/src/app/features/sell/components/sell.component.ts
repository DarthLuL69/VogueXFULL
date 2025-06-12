import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services';
import { DesignersService, Designer } from '../../../shared/services';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

interface Category {
  id: string;
  name: string;
  subcategories?: Category[];
}

interface ProductCondition {
  id: string;
  name: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sell.component.html',
  styles: []
})
export class SellComponent implements OnInit {
  productForm: FormGroup;
  imagePreviews: string[] = [];
  maxImages = 6;
  isDragging = false;
  isDropdownOpen = false;
  hoveredCondition: ProductCondition | null = null;

  // Categorías actualizadas
  categories: Category[] = [
    {
      id: 'menswear',
      name: 'Menswear',
      subcategories: [
        {
          id: 'tops',
          name: 'Tops',
          subcategories: [
            { id: 't-shirts', name: 'T-Shirts' },
            { id: 'shirts', name: 'Shirts' },
            { id: 'hoodies', name: 'Hoodies' },
            { id: 'sweaters', name: 'Sweaters' },
            { id: 'polos', name: 'Polos' }
          ]
        },
        {
          id: 'bottoms',
          name: 'Bottoms',
          subcategories: [
            { id: 'jeans', name: 'Jeans' },
            { id: 'pants', name: 'Pants' },
            { id: 'shorts', name: 'Shorts' },
            { id: 'joggers', name: 'Joggers' }
          ]
        },
        {
          id: 'outerwear',
          name: 'Outerwear',
          subcategories: [
            { id: 'jackets', name: 'Jackets' },
            { id: 'coats', name: 'Coats' },
            { id: 'blazers', name: 'Blazers' },
            { id: 'vests', name: 'Vests' }
          ]
        },
        {
          id: 'accessories',
          name: 'Accessories',
          subcategories: [
            { id: 'belts', name: 'Belts' },
            { id: 'watches', name: 'Watches' },
            { id: 'bags', name: 'Bags' },
            { id: 'hats', name: 'Hats' }
          ]
        }
      ]
    },
    {
      id: 'womenswear',
      name: 'Womenswear',
      subcategories: [
        {
          id: 'tops',
          name: 'Tops',
          subcategories: [
            { id: 'blouses', name: 'Blouses' },
            { id: 't-shirts', name: 'T-Shirts' },
            { id: 'sweaters', name: 'Sweaters' },
            { id: 'tank-tops', name: 'Tank Tops' }
          ]
        },
        {
          id: 'bottoms',
          name: 'Bottoms',
          subcategories: [
            { id: 'jeans', name: 'Jeans' },
            { id: 'skirts', name: 'Skirts' },
            { id: 'pants', name: 'Pants' },
            { id: 'shorts', name: 'Shorts' }
          ]
        },
        {
          id: 'dresses',
          name: 'Dresses',
          subcategories: [
            { id: 'casual-dresses', name: 'Casual Dresses' },
            { id: 'evening-dresses', name: 'Evening Dresses' },
            { id: 'maxi-dresses', name: 'Maxi Dresses' }
          ]
        },
        {
          id: 'outerwear',
          name: 'Outerwear',
          subcategories: [
            { id: 'jackets', name: 'Jackets' },
            { id: 'coats', name: 'Coats' },
            { id: 'cardigans', name: 'Cardigans' }
          ]
        },
        {
          id: 'accessories',
          name: 'Accessories',
          subcategories: [
            { id: 'bags', name: 'Bags' },
            { id: 'jewelry', name: 'Jewelry' },
            { id: 'scarves', name: 'Scarves' },
            { id: 'belts', name: 'Belts' }
          ]
        }
      ]
    },
    {
      id: 'sneakers',
      name: 'Footwear',
      subcategories: [
        {
          id: 'sneakers',
          name: 'Sneakers',
          subcategories: [
            { id: 'low-top-sneakers', name: 'Low Top Sneakers' },
            { id: 'high-top-sneakers', name: 'High Top Sneakers' },
            { id: 'mid-top-sneakers', name: 'Mid Top Sneakers' },
            { id: 'slip-on-sneakers', name: 'Slip-On Sneakers' },
            { id: 'running-shoes', name: 'Running Shoes' },
            { id: 'basketball-shoes', name: 'Basketball Shoes' }
          ]
        },
        {
          id: 'boots',
          name: 'Boots',
          subcategories: [
            { id: 'ankle-boots', name: 'Ankle Boots' },
            { id: 'combat-boots', name: 'Combat Boots' },
            { id: 'chelsea-boots', name: 'Chelsea Boots' },
            { id: 'work-boots', name: 'Work Boots' },
            { id: 'hiking-boots', name: 'Hiking Boots' },
            { id: 'desert-boots', name: 'Desert Boots' }
          ]
        },
        {
          id: 'casual',
          name: 'Casual',
          subcategories: [
            { id: 'loafers', name: 'Loafers' },
            { id: 'moccasins', name: 'Moccasins' },
            { id: 'boat-shoes', name: 'Boat Shoes' },
            { id: 'espadrilles', name: 'Espadrilles' },
            { id: 'canvas-shoes', name: 'Canvas Shoes' }
          ]
        },
        {
          id: 'sandals',
          name: 'Sandals',
          subcategories: [
            { id: 'flip-flops', name: 'Flip Flops' },
            { id: 'slides', name: 'Slides' },
            { id: 'sport-sandals', name: 'Sport Sandals' },
            { id: 'dress-sandals', name: 'Dress Sandals' }
          ]
        },
        {
          id: 'formal',
          name: 'Formal',
          subcategories: [
            { id: 'oxford-shoes', name: 'Oxford Shoes' },
            { id: 'derby-shoes', name: 'Derby Shoes' },
            { id: 'brogues', name: 'Brogues' },
            { id: 'monk-straps', name: 'Monk Straps' },
            { id: 'dress-boots', name: 'Dress Boots' }
          ]
        }
      ]
    }
  ];

  // Sistema de tallas
  sizeMappings: { [key: string]: string[] } = {
    't-shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'polos': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'sweaters': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'hoodies': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blouses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'tank-tops': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'jeans': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],
    'pants': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],
    'shorts': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],
    'joggers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'skirts': ['28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48'],
    'low-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'high-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'mid-top-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'slip-on-sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'running-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'basketball-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'ankle-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'combat-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'chelsea-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'work-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'hiking-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'desert-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'loafers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'moccasins': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'boat-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'espadrilles': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'canvas-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'flip-flops': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'slides': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'sport-sandals': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'dress-sandals': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'oxford-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'derby-shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'brogues': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'monk-straps': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'dress-boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'jackets': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'coats': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blazers': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'vests': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'cardigans': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'casual-dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'evening-dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'maxi-dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'belts': ['S', 'M', 'L', 'XL'],
    'watches': ['One Size'],
    'bags': ['One Size'],
    'hats': ['S', 'M', 'L', 'XL'],
    'jewelry': ['One Size'],
    'scarves': ['One Size']
  };

  productConditions: ProductCondition[] = [
    {
      id: 'new_with_tags',
      name: 'Nuevo con etiquetas',
      color: '#4CAF50',
      description: 'Producto completamente nuevo con todas sus etiquetas originales'
    },
    {
      id: 'new_without_tags',
      name: 'Nuevo sin etiquetas',
      color: '#8BC34A',
      description: 'Producto nuevo pero sin etiquetas originales'
    },
    {
      id: 'like_new',
      name: 'Como nuevo',
      color: '#CDDC39',
      description: 'Producto usado una o dos veces, en excelente estado'
    },
    {
      id: 'good',
      name: 'Buen estado',
      color: '#FFC107',
      description: 'Producto usado pero en buen estado, con signos mínimos de uso'
    },
    {
      id: 'fair',
      name: 'Estado regular',
      color: '#FF9800',
      description: 'Producto usado con signos visibles de uso pero funcional'
    },
    {
      id: 'poor',
      name: 'Mal estado',
      color: '#F44336',
      description: 'Producto muy usado o con daños significativos'
    }
  ];

  selectedMainCategory: string = '';
  selectedSubCategory: string = '';
  selectedFinalCategory: string = '';

  // Designer search functionality
  designerSuggestions: Designer[] = [];
  showDesignerSuggestions = false;
  brandSearchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    private designersService: DesignersService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      price: ['', [Validators.required, Validators.min(0)]],
      condition: ['', Validators.required],
      size: ['', Validators.required],
      mainCategory: ['', Validators.required],
      subCategory: ['', Validators.required],
      finalCategory: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.brandSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          this.designerSuggestions = [];
          this.showDesignerSuggestions = false;
          return [];
        }
        return this.designersService.searchDesigners(query);
      })
    ).subscribe(designers => {
      this.designerSuggestions = designers.slice(0, 10);
      this.showDesignerSuggestions = this.designerSuggestions.length > 0;
    });
  }

  // Image handling methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  private handleFiles(files: File[]): void {
    if (this.imagePreviews.length + files.length > this.maxImages) {
      alert(`Solo puedes subir un máximo de ${this.maxImages} imágenes`);
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
  }

  // Category methods
  onMainCategoryChange(categoryId: string): void {
    this.selectedMainCategory = categoryId;
    this.selectedSubCategory = '';
    this.selectedFinalCategory = '';
    
    this.productForm.patchValue({
      mainCategory: categoryId,
      subCategory: '',
      finalCategory: '',
      size: ''
    });
  }

  onSubCategoryChange(categoryId: string): void {
    this.selectedSubCategory = categoryId;
    this.selectedFinalCategory = '';
    
    this.productForm.patchValue({
      subCategory: categoryId,
      finalCategory: '',
      size: ''
    });
  }

  onFinalCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const category = target?.value;
    
    if (category) {
      this.productForm.patchValue({ 
        finalCategory: category,
        size: '' 
      });
      this.selectedFinalCategory = category;
    }
  }

  getSubCategories(): Category[] {
    const mainCategory = this.categories.find(cat => cat.id === this.selectedMainCategory);
    return mainCategory?.subcategories || [];
  }

  getFinalCategories(): Category[] {
    const mainCategory = this.categories.find(cat => cat.id === this.selectedMainCategory);
    const subCategory = mainCategory?.subcategories?.find(sub => sub.id === this.selectedSubCategory);
    return subCategory?.subcategories || [];
  }

  getMainCategoryName(): string {
    const category = this.categories.find(cat => cat.id === this.selectedMainCategory);
    return category?.name || '';
  }

  getSubCategoryName(): string {
    const mainCategory = this.categories.find(cat => cat.id === this.selectedMainCategory);
    const subCategory = mainCategory?.subcategories?.find(sub => sub.id === this.selectedSubCategory);
    return subCategory?.name || '';
  }

  getFinalCategoryName(): string {
    const mainCategory = this.categories.find(cat => cat.id === this.selectedMainCategory);
    const subCategory = mainCategory?.subcategories?.find(sub => sub.id === this.selectedSubCategory);
    const finalCategory = subCategory?.subcategories?.find(final => final.id === this.selectedFinalCategory);
    return finalCategory?.name || '';
  }

  // Size methods
  getAvailableSizes(): string[] {
    const selectedCategory = this.productForm.get('finalCategory')?.value;
    if (!selectedCategory) {
      return [];
    }
    return this.sizeMappings[selectedCategory] || [];
  }

  // Brand/Designer methods
  onBrandInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.brandSearchSubject.next(target.value);
    }
  }

  onBrandFocus(): void {
    if (this.designerSuggestions.length > 0) {
      this.showDesignerSuggestions = true;
    }
  }

  onBrandBlur(): void {
    setTimeout(() => {
      this.showDesignerSuggestions = false;
    }, 200);
  }

  selectDesigner(designer: Designer): void {
    this.productForm.patchValue({ brand: designer.name });
    this.showDesignerSuggestions = false;
  }

  // Condition methods
  toggleConditionDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onConditionHover(condition: ProductCondition): void {
    this.hoveredCondition = condition;
  }

  onConditionLeave(): void {
    this.hoveredCondition = null;
  }

  selectCondition(condition: ProductCondition): void {
    this.productForm.patchValue({ condition: condition.id });
    this.isDropdownOpen = false;
  }

  getConditionColor(conditionId: string): string {
    const condition = this.productConditions.find(c => c.id === conditionId);
    return condition?.color || '#000000';
  }

  getConditionDescription(conditionId: string): string {
    const condition = this.productConditions.find(c => c.id === conditionId);
    return condition?.description || '';
  }

  getConditionName(conditionId: string): string {
    const condition = this.productConditions.find(c => c.id === conditionId);
    return condition?.name || '';
  }

  // Form validation methods
  isFormValid(): boolean {
    const formValid = this.productForm.valid;
    const hasImages = this.imagePreviews.length > 0;
    const hasAllCategories = !!(this.selectedMainCategory && this.selectedSubCategory && this.selectedFinalCategory);
    
    return formValid && hasImages && hasAllCategories;
  }

  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Submit methods
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.showFormErrors();
      return;
    }

    const formData = new FormData();
    
    Object.keys(this.productForm.value).forEach(key => {
      const value = this.productForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    
    this.imagePreviews.forEach((preview, index) => {
      formData.append(`images[${index}]`, preview);
    });

    this.apiService.createProduct(formData).subscribe({
      next: (response: any) => {
        alert('¡Producto publicado exitosamente!');
        this.resetForm();
        this.router.navigate(['/shop']);
      },
      error: (error: any) => {
        console.error('Error creating product:', error);
        alert('Error al publicar el producto. Intenta de nuevo.');
      }
    });
  }

  private showFormErrors(): void {
    if (this.imagePreviews.length === 0) {
      alert('Debes subir al menos una imagen');
      return;
    }

    if (!this.selectedMainCategory || !this.selectedSubCategory || !this.selectedFinalCategory) {
      alert('Debes seleccionar todas las categorías');
      return;
    }

    const errors: string[] = [];
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      if (control && control.invalid) {
        control.markAsTouched();
        if (control.errors?.['required']) {
          errors.push(`${key} es requerido`);
        }
      }
    });

    if (errors.length > 0) {
      alert(`Errores: ${errors.join(', ')}`);
    }
  }

  private resetForm(): void {
    this.productForm.reset();
    this.imagePreviews = [];
    this.selectedMainCategory = '';
    this.selectedSubCategory = '';
    this.selectedFinalCategory = '';
  }

  onCancel(): void {
    if (confirm('¿Seguro que quieres cancelar?')) {
      this.router.navigate(['/profile']);
    }
  }
}