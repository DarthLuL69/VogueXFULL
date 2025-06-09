<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SearchHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'search_term',
        'filters',
        'results_count'
    ];

    protected $casts = [
        'filters' => 'array',
        'results_count' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
