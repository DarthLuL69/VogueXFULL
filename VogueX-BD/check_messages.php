<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Obtener el pago con la información del chat
$payment = App\Models\Payment::with('offer.chat')->find(1);
echo "Chat ID: " . $payment->offer->chat_id . "\n";

// Obtener los mensajes más recientes del chat
$messages = App\Models\Message::where('chat_id', $payment->offer->chat_id)
    ->orderBy('created_at', 'desc')
    ->take(3)
    ->get();

echo "Mensajes recientes:\n";
foreach ($messages as $message) {
    echo "- " . $message->content . " (de usuario: " . $message->user_id . ")\n";
}
