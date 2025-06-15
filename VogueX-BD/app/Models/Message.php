<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'user_id',
        'content',
        'type',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    // Tipos de mensajes
    const TYPE_TEXT = 'text';
    const TYPE_OFFER = 'offer';
    const TYPE_SYSTEM = 'system';

    // Relación con el chat
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    // Relación con el usuario
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación con la oferta (si es un mensaje de oferta)
    public function offer()
    {
        return $this->hasOne(Offer::class, 'message_id');
    }

    // Marcar mensaje como leído
    public function markAsRead()
    {
        if (!$this->read_at) {
            $this->read_at = now();
            $this->save();
        }
    }

    // Scope para mensajes no leídos
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }
}
