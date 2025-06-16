<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Obtener el pago y la orden
$payment = App\Models\Payment::with(['offer.product', 'offer.seller', 'offer.buyer'])->find(1);
$order = App\Models\Order::where('payment_id', 1)->first();

echo "Payment ID: " . $payment->id . "\n";
echo "Order ID: " . $order->id . "\n";
echo "Tracking: " . $order->tracking_number . "\n";

// Buscar o crear el chat
$chat = App\Models\Chat::where('buyer_id', $payment->buyer_id)
    ->where('seller_id', $payment->seller_id)
    ->where('product_id', $payment->offer->product_id)
    ->first();

if (!$chat) {
    echo "No se encontró chat, creando uno nuevo...\n";
    $chat = App\Models\Chat::create([
        'buyer_id' => $payment->buyer_id,
        'seller_id' => $payment->seller_id,
        'product_id' => $payment->offer->product_id
    ]);
}

echo "Chat ID: " . $chat->id . "\n";

// Crear mensaje de notificación
$message1 = App\Models\Message::create([
    'chat_id' => $chat->id,
    'user_id' => $payment->buyer_id,
    'content' => '🎉 ¡Pago procesado exitosamente! El paquete está en camino. Número de seguimiento: ' . $order->tracking_number,
    'type' => 'payment',
    'offer_id' => $payment->offer_id
]);

$message2 = App\Models\Message::create([
    'chat_id' => $chat->id,
    'user_id' => $payment->seller_id,
    'content' => '✅ Hemos recibido tu pago. Tu pedido está siendo preparado para el envío. Te notificaremos cuando esté en camino.',
    'type' => 'payment'
]);

echo "Mensajes enviados:\n";
echo "- Mensaje 1 ID: " . $message1->id . "\n";
echo "- Mensaje 2 ID: " . $message2->id . "\n";
