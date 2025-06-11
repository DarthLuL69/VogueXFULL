import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services';
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

interface SizeSystem {
  id: string;
  name: string;
  sizes: string[];
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
  selectedSizeSystem: SizeSystem | null = null;

  sizeSystems: { [key: string]: SizeSystem[] } = {
    // Ropa superior
    'tshirts': [
      {
        id: 'eu',
        name: 'Tallas Europeas',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        id: 'us',
        name: 'Tallas USA',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        id: 'uk',
        name: 'Tallas UK',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      }
    ],
    'shirts': [
      {
        id: 'eu',
        name: 'Tallas Europeas',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        id: 'us',
        name: 'Tallas USA',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        id: 'uk',
        name: 'Tallas UK',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      }
    ],
    // Ropa inferior
    'pants': [
      {
        id: 'waist',
        name: 'Talla de Cintura (cm)',
        sizes: ['28', '30', '32', '34', '36', '38', '40', '42']
      },
      {
        id: 'eu',
        name: 'Tallas Europeas',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        id: 'us',
        name: 'Tallas USA',
        sizes: ['28', '30', '32', '34', '36', '38', '40', '42']
      }
    ],
    'jeans': [
      {
        id: 'waist',
        name: 'Talla de Cintura (cm)',
        sizes: ['28', '30', '32', '34', '36', '38', '40', '42']
      },
      {
        id: 'eu',
        name: 'Tallas Europeas',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        id: 'us',
        name: 'Tallas USA',
        sizes: ['28', '30', '32', '34', '36', '38', '40', '42']
      }
    ],
    // Calzado
    'shoes': [
      {
        id: 'eu',
        name: 'Tallas Europeas',
        sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
      },
      {
        id: 'uk',
        name: 'Tallas UK',
        sizes: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13']
      },
      {
        id: 'us',
        name: 'Tallas USA',
        sizes: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14']
      }
    ],
    // Vestidos
    'dresses': [
      {
        id: 'eu',
        name: 'Tallas Europeas',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      },
      {
        id: 'us',
        name: 'Tallas USA',
        sizes: ['0', '2', '4', '6', '8', '10', '12', '14', '16']
      },
      {
        id: 'uk',
        name: 'Tallas UK',
        sizes: ['4', '6', '8', '10', '12', '14', '16', '18', '20']
      }
    ]
  };

  productConditions: ProductCondition[] = [
    {
      id: 'new_with_tags',
      name: 'Nuevo con etiquetas',
      color: '#4CAF50', // Verde fuerte
      description: 'Producto completamente nuevo con todas sus etiquetas originales'
    },
    {
      id: 'new_without_tags',
      name: 'Nuevo sin etiquetas',
      color: '#8BC34A', // Verde claro
      description: 'Producto nuevo pero sin etiquetas originales'
    },
    {
      id: 'like_new',
      name: 'Como nuevo',
      color: '#CDDC39', // Verde lima
      description: 'Producto usado una o dos veces, en excelente estado'
    },
    {
      id: 'good',
      name: 'Buen estado',
      color: '#FFC107', // Amarillo
      description: 'Producto usado pero en buen estado, con signos mínimos de uso'
    },
    {
      id: 'fair',
      name: 'Estado regular',
      color: '#FF9800', // Naranja
      description: 'Producto usado con signos visibles de uso pero funcional'
    },
    {
      id: 'poor',
      name: 'Mal estado',
      color: '#F44336', // Rojo
      description: 'Producto muy usado o con daños significativos'
    }
  ];

  categories: Category[] = [
    {
      id: 'menswear',
      name: 'Menswear',
      subcategories: [
        {
          id: 'tops',
          name: 'Tops',
          subcategories: [
            { id: 'tshirts', name: 'T-Shirts' },
            { id: 'shirts', name: 'Shirts' },
            { id: 'polos', name: 'Polos' },
            { id: 'sweaters', name: 'Sweaters' }
          ]
        },
        {
          id: 'bottoms',
          name: 'Bottoms',
          subcategories: [
            { id: 'pants', name: 'Pants' },
            { id: 'jeans', name: 'Jeans' },
            { id: 'shorts', name: 'Shorts' }
          ]
        },
        {
          id: 'footwear',
          name: 'Footwear',
          subcategories: [
            { id: 'shoes', name: 'Shoes' },
            { id: 'sneakers', name: 'Sneakers' },
            { id: 'boots', name: 'Boots' }
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
            { id: 'tops', name: 'Tops' },
            { id: 'blouses', name: 'Blouses' }
          ]
        },
        {
          id: 'dresses',
          name: 'Dresses',
          subcategories: [
            { id: 'dresses', name: 'Dresses' }
          ]
        },
        {
          id: 'bottoms',
          name: 'Bottoms',
          subcategories: [
            { id: 'skirts', name: 'Skirts' },
            { id: 'pants', name: 'Pants' }
          ]
        }
      ]
    }
  ];

  selectedMainCategory: string = '';
  selectedSubCategory: string = '';
  selectedFinalCategory: string = '';

  sizeMappings: { [key: string]: string[] } = {
    // Ropa superior
    'tshirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'shirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'polos': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'sweaters': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'tops': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'blouses': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    // Ropa inferior
    'pants': ['28', '30', '32', '34', '36', '38', '40', '42'],
    'jeans': ['28', '30', '32', '34', '36', '38', '40', '42'],
    'shorts': ['28', '30', '32', '34', '36', '38', '40', '42'],
    'skirts': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    // Calzado
    'shoes': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'sneakers': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    'boots': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
    
    // Vestidos
    'dresses': ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  };

  brandSuggestions: any[] = [];
  brandSearchSubject = new Subject<string>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private apiService: ApiService
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

    // Suscribirse a cambios en la categoría final para actualizar los sistemas de tallas
    this.productForm.get('finalCategory')?.valueChanges.subscribe(category => {
      this.updateSizeSystems(category);
    });
  }

  ngOnInit(): void {
    // Setup brand autocomplete
    this.brandSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) return [];
        return this.apiService.searchBrands(query);
      })
    ).subscribe(brands => {
      this.brandSuggestions = brands;
    });
  }

  onMainCategoryChange(categoryId: string): void {
    this.selectedMainCategory = categoryId;
    this.selectedSubCategory = '';
    this.selectedFinalCategory = '';
    this.productForm.patchValue({
      subCategory: '',
      finalCategory: ''
    });
  }

  onSubCategoryChange(categoryId: string): void {
    this.selectedSubCategory = categoryId;
    this.selectedFinalCategory = '';
    this.productForm.patchValue({
      finalCategory: ''
    });
  }

  onFinalCategoryChange(event: Event): void {
    const category = (event.target as HTMLSelectElement).value;
    console.log('Cambio de categoría a:', category);
    
    // Resetear la talla cuando cambia la categoría
    this.productForm.patchValue({ size: '' });
    
    // Actualizar la categoría final
    this.selectedFinalCategory = category;
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
    // Verificar si excedemos el límite de imágenes
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

  onSubmit(): void {
    if (this.productForm.valid && this.imagePreviews.length > 0) {
      // Aquí iría la lógica para enviar el formulario al backend
      console.log('Formulario enviado:', {
        ...this.productForm.value,
        images: this.imagePreviews
      });
      
      // Redirigir a la página de éxito o lista de productos
      this.router.navigate(['/profile']);
    } else {
      if (this.imagePreviews.length === 0) {
        alert('Debes subir al menos una imagen');
      }
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los datos.')) {
      this.router.navigate(['/profile']);
    }
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

  toggleConditionDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onConditionHover(condition: ProductCondition) {
    this.hoveredCondition = condition;
  }

  onConditionLeave() {
    this.hoveredCondition = null;
  }

  selectCondition(condition: ProductCondition) {
    this.productForm.patchValue({ condition: condition.id });
    this.isDropdownOpen = false;
  }

  updateSizeSystems(category: string) {
    const systems = this.sizeSystems[category] || [];
    this.selectedSizeSystem = null;
    this.productForm.patchValue({
      sizeSystem: '',
      size: ''
    });
  }

  onSizeSystemChange(systemId: string) {
    const category = this.productForm.get('finalCategory')?.value;
    const systems = this.sizeSystems[category] || [];
    this.selectedSizeSystem = systems.find(s => s.id === systemId) || null;
    this.productForm.patchValue({ size: '' });
  }

  getAvailableSizeSystems(): SizeSystem[] {
    const category = this.productForm.get('finalCategory')?.value;
    return this.sizeSystems[category] || [];
  }

  getAvailableSizes(): string[] {
    const selectedCategory = this.productForm.get('finalCategory')?.value;
    console.log('Categoría seleccionada:', selectedCategory);
    
    if (!selectedCategory) {
      return [];
    }

    const sizes = this.sizeMappings[selectedCategory] || [];
    console.log('Tallas disponibles:', sizes);
    return sizes;
  }

  onBrandInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.brandSearchSubject.next(target.value);
    }
  }

  selectBrand(brand: any): void {
    this.productForm.patchValue({ brand: brand.name });
    this.brandSuggestions = [];
  }
}