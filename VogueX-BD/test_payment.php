<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Obtener primer usuario
$user = App\Models\User::first();
if (!$user) {
    echo "No users found\n";
    exit;
}

// Crear token
$token = $user->createToken('test-payment')->plainTextToken;
echo "User ID: " . $user->id . "\n";
echo "Token: " . $token . "\n";

// Obtener primer producto
$product = App\Models\Product::first();
if (!$product) {
    echo "No products found\n";
    exit;
}

echo "Product ID: " . $product->id . "\n";
echo "Product Name: " . $product->name . "\n";
echo "Product Price: " . $product->price . "\n";

// Obtener primera oferta
$offer = App\Models\Offer::first();
if (!$offer) {
    echo "No offers found\n";
    exit;
}

echo "Offer ID: " . $offer->id . "\n";
echo "Offer Product ID: " . $offer->product_id . "\n";
echo "Offer Price: " . $offer->price . "\n";
