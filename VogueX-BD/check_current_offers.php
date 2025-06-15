<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Offer;

echo "=== SOLUCIONANDO CONFLICTO ===" . PHP_EOL;

// Buscar ofertas pendientes
$pendingOffer = Offer::where('status', 'pending')->orderBy('created_at', 'desc')->first();

if ($pendingOffer) {
    echo "Encontrada oferta pendiente: ID {$pendingOffer->id}, Chat: {$pendingOffer->chat_id}, Amount: {$pendingOffer->amount}" . PHP_EOL;
    
    // Cambiar status a rejected
    $pendingOffer->status = 'rejected';
    $pendingOffer->rejected_at = now();
    $pendingOffer->save();
    
    echo "✅ Oferta ID {$pendingOffer->id} marcada como 'rejected'." . PHP_EOL;
    echo "Ahora puedes crear una nueva oferta." . PHP_EOL;
} else {
    echo "No se encontraron ofertas pendientes." . PHP_EOL;
}

echo PHP_EOL . "=== ESTADO FINAL ===" . PHP_EOL;
$remainingPending = Offer::whereIn('status', ['pending', 'accepted'])->count();
echo "Ofertas pendientes restantes: {$remainingPending}" . PHP_EOL;
