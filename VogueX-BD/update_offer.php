<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Obtener primera oferta
$offer = App\Models\Offer::first();
if (!$offer) {
    echo "No offers found\n";
    exit;
}

echo "Offer ID: " . $offer->id . "\n";
echo "Current Status: " . $offer->status . "\n";
echo "Buyer ID: " . $offer->buyer_id . "\n";
echo "Seller ID: " . $offer->seller_id . "\n";
echo "Product ID: " . $offer->product_id . "\n";
echo "Price: " . $offer->amount . "\n";

// Actualizar estado a aceptada
$offer->status = 'accepted';
$offer->amount = 120.00; // Establecer un precio válido
$offer->save();

echo "Updated Status: " . $offer->status . "\n";
