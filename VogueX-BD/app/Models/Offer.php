<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'product_id',
        'buyer_id',
        'seller_id',
        'message_id',
        'amount',
        'currency',
        'status',
        'expires_at',
        'accepted_at',
        'rejected_at',
        'payment_intent_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    // Estados posibles de una oferta
    const STATUS_PENDING = 'pending';
    const STATUS_ACCEPTED = 'accepted';
    const STATUS_REJECTED = 'rejected';
    const STATUS_EXPIRED = 'expired';
    const STATUS_PAID = 'paid';
    const STATUS_CANCELLED = 'cancelled';

    // Relación con el chat
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    // Relación con el producto
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Relación con el comprador
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    // Relación con el vendedor
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    // Relación con el mensaje
    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    // Scope para ofertas pendientes
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    // Aceptar una oferta
    public function accept()
    {
        $this->status = self::STATUS_ACCEPTED;
        $this->accepted_at = now();
        $this->save();

        return $this;
    }

    // Rechazar una oferta
    public function reject()
    {
        $this->status = self::STATUS_REJECTED;
        $this->rejected_at = now();
        $this->save();

        return $this;
    }

    // Marcar como expirada
    public function expire()
    {
        if ($this->status === self::STATUS_PENDING && now()->gt($this->expires_at)) {
            $this->status = self::STATUS_EXPIRED;
            $this->save();
        }

        return $this;
    }

    // Marcar como pagada
    public function markAsPaid($paymentIntentId = null)
    {
        $this->status = self::STATUS_PAID;
        if ($paymentIntentId) {
            $this->payment_intent_id = $paymentIntentId;
        }
        $this->save();

        return $this;
    }

    // Comprobar si la oferta está vigente
    public function isActive()
    {
        $this->expire(); // Actualiza el estado si ha expirado
        return $this->status === self::STATUS_PENDING;
    }
}
