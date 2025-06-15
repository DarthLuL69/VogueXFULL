<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Offer;

echo "=== VERIFICANDO ESTADO ACTUAL ===" . PHP_EOL;

// Mostrar todas las ofertas
$offers = Offer::all();
foreach ($offers as $offer) {
    echo "Oferta ID: {$offer->id}, Chat: {$offer->chat_id}, Status: {$offer->status}, Amount: {$offer->amount}" . PHP_EOL;
}

echo PHP_EOL . "=== OFERTAS PENDIENTES ===" . PHP_EOL;
$pendingOffers = Offer::whereIn('status', ['pending', 'accepted'])->get();
if ($pendingOffers->count() > 0) {
    foreach ($pendingOffers as $offer) {
        echo "Chat {$offer->chat_id}: Oferta {$offer->id} - Status: {$offer->status}" . PHP_EOL;
    }
} else {
    echo "✅ No hay ofertas pendientes. Puedes crear nuevas ofertas." . PHP_EOL;
}
