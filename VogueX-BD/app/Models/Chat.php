<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'seller_id',
        'product_id',
        'last_message',
        'last_message_time',
        'unread_buyer',
        'unread_seller',
        'status',
    ];

    protected $casts = [
        'last_message_time' => 'datetime',
        'unread_buyer' => 'integer',
        'unread_seller' => 'integer',
    ];

    // Relación con el usuario comprador
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    // Relación con el usuario vendedor
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    // Relación con el producto
    public function product()
    {
        return $this->belongsTo(Product::class);
    }    // Relación con los mensajes del chat
    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    // Relación con el último mensaje
    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    // Relación con las ofertas
    public function offers()
    {
        return $this->hasMany(Offer::class)->orderBy('created_at', 'desc');
    }

    // Obtener la última oferta activa
    public function activeOffer()
    {
        return $this->offers()->where('status', 'pending')->latest()->first();
    }
}
