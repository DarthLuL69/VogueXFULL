<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'offer_id',
        'buyer_id',
        'seller_id',
        'product_id',
        'amount',
        'currency',
        'payment_method',
        'payment_provider',
        'provider_payment_id',
        'provider_intent_id',
        'status',
        'completed_at',
        'refunded_at',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'completed_at' => 'datetime',
        'refunded_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Estados de pago
    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';
    const STATUS_CANCELLED = 'cancelled';

    // Proveedores de pago
    const PROVIDER_STRIPE = 'stripe';
    const PROVIDER_PAYPAL = 'paypal';
    const PROVIDER_APPLE_PAY = 'apple_pay';

    // Métodos de pago
    const METHOD_CREDIT_CARD = 'credit_card';
    const METHOD_DEBIT_CARD = 'debit_card';
    const METHOD_PAYPAL = 'paypal';
    const METHOD_APPLE_PAY = 'apple_pay';

    // Relaciones
    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Marcar como completado
    public function markAsCompleted()
    {
        $this->status = self::STATUS_COMPLETED;
        $this->completed_at = now();
        $this->save();

        return $this;
    }

    // Marcar como fallido
    public function markAsFailed()
    {
        $this->status = self::STATUS_FAILED;
        $this->save();

        return $this;
    }

    // Comprobar si está completo
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    // Comprobar si está pendiente
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING || $this->status === self::STATUS_PROCESSING;
    }
}
