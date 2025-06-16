<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'subject',
        'message',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'timestamp'
    ];

    // Scope para mensajes no leídos
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    // Scope para mensajes leídos
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    // Marcar como leído
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }
}
