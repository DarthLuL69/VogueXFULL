<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Obtener usuario 2 (el buyer de la oferta)
$user = App\Models\User::find(2);
if (!$user) {
    echo "User 2 not found\n";
    exit;
}

// Crear token
$token = $user->createToken('test-payment-buyer')->plainTextToken;
echo "Buyer User ID: " . $user->id . "\n";
echo "Buyer Token: " . $token . "\n";
