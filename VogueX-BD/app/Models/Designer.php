<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Designer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'image_url',
        'description',
        'website',
        'is_popular',
        'is_featured',
        'items_count',
        'categories'
    ];

    protected $casts = [
        'is_popular' => 'boolean',
        'is_featured' => 'boolean',
        'categories' => 'array'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($designer) {
            if (empty($designer->slug)) {
                $designer->slug = Str::slug($designer->name);
            }
        });
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function getFirstLetterAttribute()
    {
        $firstChar = strtoupper(substr($this->name, 0, 1));
        return ctype_alpha($firstChar) ? $firstChar : '#';
    }
}
