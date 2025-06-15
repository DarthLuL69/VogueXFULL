<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand',
        'description',
        'price',
        'original_price',
        'condition',
        'size',
        'main_category',
        'sub_category',
        'final_category',
        'image_url',
        'images',
        'category_id',
        'is_active',
        'status',
        'user_id'
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Scopes para filtrado
    public function scopeByCategory($query, $category)
    {
        return $query->where('main_category', $category);
    }

    public function scopeBySubcategory($query, $subcategory)
    {
        return $query->where('sub_category', $subcategory);
    }

    public function scopeByBrand($query, $brand)
    {
        return $query->where('brand', 'like', "%{$brand}%");
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')->where('is_active', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('brand', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%");
        });
    }

    // Accessor para la imagen principal
    public function getMainImageAttribute()
    {
        // Priorizar el campo images si existe y tiene contenido
        if ($this->images && is_array($this->images) && !empty($this->images)) {
            return $this->images[0];
        }
        
        // Usar image_url como fallback
        if ($this->image_url) {
            return $this->image_url;
        }
        
        return null;
    }    // Accessor para obtener todas las imágenes
    public function getAllImagesAttribute()
    {
        if ($this->images && is_array($this->images)) {
            return $this->images;
        }
        
        if ($this->image_url) {
            return [$this->image_url];
        }
        
        return [];
    }
    
    // Relación con el usuario que subió el producto
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
