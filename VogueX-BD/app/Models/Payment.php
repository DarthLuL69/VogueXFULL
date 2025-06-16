<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
      protected $fillable = [
        'offer_id',
        'product_id',
        'buyer_id',
        'seller_id',
        'amount',
        'payment_method',
        'status',
        'currency',
        'transaction_id',
        'processed_at',
        'shipping_address',
        'payment_provider'
    ];    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
        'shipping_address' => 'array'
    ];

    /**
     * Get the offer that this payment is for
     */
    public function offer()
    {
        return $this->belongsTo(Offer::class);
    }

    /**
     * Get the buyer user
     */
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * Get the seller user
     */
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    /**
     * Get the product through the offer
     */
    public function product()
    {
        return $this->hasOneThrough(Product::class, Offer::class, 'id', 'id', 'offer_id', 'product_id');
    }

    /**
     * Mark payment as completed
     */
    public function markAsCompleted()
    {
        $this->status = self::STATUS_COMPLETED;
        $this->processed_at = now();
        $this->save();

        return $this;
    }

    /**
     * Mark payment as failed
     */
    public function markAsFailed()
    {
        $this->status = self::STATUS_FAILED;
        $this->save();

        return $this;
    }

    /**
     * Check if payment is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if payment is pending
     */
    public function isPending()
    {
        return $this->status === self::STATUS_PENDING || $this->status === self::STATUS_PROCESSING;
    }
}
