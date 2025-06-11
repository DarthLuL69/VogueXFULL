<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'category_id',
        'designer_id',
        'brand',
        'size',
        'condition',
        'original_price',
        'image_url',
        'images',
        'is_active'
    ];

    protected $casts = [
        'images' => 'array',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'original_price' => 'decimal:2'
    ];

    protected static function boot()
    {
        parent::boot();

        // Cuando se crea un producto, actualizar contador del diseñador
        static::created(function ($product) {
            if ($product->designer_id) {
                $product->designer->increment('items_count');
            }
        });

        // Cuando se elimina un producto, decrementar contador del diseñador
        static::deleted(function ($product) {
            if ($product->designer_id) {
                $product->designer->decrement('items_count');
            }
        });

        // Cuando se actualiza el designer_id, ajustar contadores
        static::updated(function ($product) {
            if ($product->isDirty('designer_id')) {
                $original = $product->getOriginal('designer_id');
                $new = $product->designer_id;

                if ($original) {
                    Designer::find($original)->decrement('items_count');
                }
                if ($new) {
                    Designer::find($new)->increment('items_count');
                }
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function designer()
    {
        return $this->belongsTo(Designer::class);
    }
}
