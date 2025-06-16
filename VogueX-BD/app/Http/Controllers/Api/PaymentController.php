<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Initialize a payment for an accepted offer
     */
    public function initialize(Request $request)
    {
        try {
            $validated = $request->validate([
                'offer_id' => 'required|integer|exists:offers,id',
                'payment_method' => 'required|string|in:visa,debit,apple_pay,paypal'
            ]);

            Log::info('Payment initialization request', $validated);

            $offer = Offer::with(['product', 'buyer', 'seller'])->find($validated['offer_id']);
            
            if (!$offer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Offer not found'
                ], 404);
            }            if ($offer->status !== 'accepted') {
                return response()->json([
                    'success' => false,
                    'message' => 'Offer must be accepted before payment can be initialized'
                ], 400);
            }

            if (Auth::id() !== $offer->buyer_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to make payment for this offer'
                ], 403);
            }

            // Check if payment already exists
            $existingPayment = Payment::where('offer_id', $offer->id)->first();
            if ($existingPayment) {
                return response()->json([
                    'success' => true,
                    'message' => 'Payment already exists',
                    'data' => [
                        'payment' => $existingPayment
                    ]
                ]);
            }            // Create the payment record
            $payment = Payment::create([
                'offer_id' => $offer->id,
                'product_id' => $offer->product_id,
                'buyer_id' => $offer->buyer_id,
                'seller_id' => $offer->seller_id,
                'amount' => $offer->amount,
                'payment_method' => $validated['payment_method'],
                'status' => 'pending',
                'currency' => 'EUR'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment initialized successfully',
                'data' => [
                    'payment' => $payment->load(['offer.product'])
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Payment initialization error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error initializing payment'
            ], 500);
        }
    }    /**
     * Process the payment (simulate payment processing)
     */
    public function process(Request $request)
    {
        try {
            $validated = $request->validate([
                'payment_id' => 'required|integer|exists:payments,id',
                'shipping_address' => 'required|array',
                'shipping_address.full_name' => 'required|string|max:255',
                'shipping_address.street_address' => 'required|string|max:255',
                'shipping_address.apartment' => 'nullable|string|max:255',
                'shipping_address.city' => 'required|string|max:255',
                'shipping_address.state' => 'required|string|max:255',
                'shipping_address.postal_code' => 'required|string|max:20',
                'shipping_address.country' => 'required|string|max:255',
                'shipping_address.phone' => 'nullable|string|max:20',
                'card_number' => 'nullable|string',
                'expiry_date' => 'nullable|string',
                'cvv' => 'nullable|string',
                'cardholder_name' => 'nullable|string'
            ]);

            $payment = Payment::with(['offer.product', 'offer.seller', 'offer.buyer'])->find($validated['payment_id']);

            if (Auth::id() !== $payment->buyer_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Simulate payment processing
            $payment->update([
                'status' => 'completed',
                'processed_at' => now(),
                'transaction_id' => 'TXN_' . strtoupper(uniqid()),
                'shipping_address' => json_encode($validated['shipping_address'])
            ]);

            // Update offer status to completed
            $payment->offer->update(['status' => 'completed']);

            // Create order record
            $order = \App\Models\Order::create([
                'user_id' => $payment->buyer_id,
                'product_id' => $payment->offer->product_id,
                'payment_id' => $payment->id,
                'total_amount' => $payment->amount,
                'status' => 'processing',
                'shipping_address' => json_encode($validated['shipping_address']),
                'tracking_number' => 'VX' . strtoupper(uniqid())
            ]);

            // Send notification message to seller
            $this->sendPaymentNotificationToSeller($payment, $order);

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully',
                'data' => [
                    'payment' => $payment,
                    'order' => $order
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment processing error', [
                'message' => $e->getMessage(),
                'payment_id' => $request->payment_id ?? 'unknown'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error processing payment'
            ], 500);
        }
    }

    /**
     * Get payment details
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = Auth::user();
        $payment = Payment::with(['offer', 'offer.chat', 'offer.product'])->findOrFail($id);
        
        // Verify user is part of the chat associated with this payment
        $chat = $payment->offer->chat;
        if ($chat->buyer_id != $user->id && $chat->seller_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this payment'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'data' => $payment
        ]);
    }

    /**
     * Get payments for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();
        
        // Get payments as a buyer
        $buyerPayments = Payment::whereHas('offer.chat', function($query) use ($user) {
            $query->where('buyer_id', $user->id);
        })->with(['offer', 'offer.chat', 'offer.product'])->get();
        
        // Get payments as a seller
        $sellerPayments = Payment::whereHas('offer.chat', function($query) use ($user) {
            $query->where('seller_id', $user->id);
        })->with(['offer', 'offer.chat', 'offer.product'])->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'as_buyer' => $buyerPayments,
                'as_seller' => $sellerPayments
            ]
        ]);
    }    /**
     * Get shipping addresses for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getShippingAddresses()
    {
        // For now, return empty array - in a real app, this would fetch from database
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    /**
     * Get supported payment methods
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSupportedPaymentMethods()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'visa' => [
                    'name' => 'Visa',
                    'icon' => 'fa-cc-visa',
                    'enabled' => true
                ],
                'debit' => [
                    'name' => 'Tarjeta de Débito',
                    'icon' => 'fa-credit-card',
                    'enabled' => true
                ],
                'apple_pay' => [
                    'name' => 'Apple Pay',
                    'icon' => 'fa-apple-pay',
                    'enabled' => true
                ],
                'paypal' => [
                    'name' => 'PayPal',
                    'icon' => 'fa-paypal',
                    'enabled' => true
                ]
            ]
        ]);    }

    /**
     * Send payment notification to seller via chat
     */
    private function sendPaymentNotificationToSeller($payment, $order)
    {
        try {
            // Find the chat for this payment
            $chat = \App\Models\Chat::where('buyer_id', $payment->buyer_id)
                ->where('seller_id', $payment->seller_id)
                ->where('product_id', $payment->offer->product_id)
                ->first();

            if ($chat) {
                // Create a system message notifying the seller
                \App\Models\Message::create([
                    'chat_id' => $chat->id,
                    'user_id' => $payment->buyer_id, // From buyer
                    'content' => '🎉 ¡Pago procesado exitosamente! El paquete está en camino. Número de seguimiento: ' . 
                                $order->tracking_number,
                    'type' => 'payment',
                    'offer_id' => $payment->offer_id
                ]);

                // Also send a message to the buyer
                \App\Models\Message::create([
                    'chat_id' => $chat->id,
                    'user_id' => $payment->seller_id, // From seller
                    'content' => '✅ Hemos recibido tu pago. Tu pedido está siendo preparado para el envío. Te notificaremos cuando esté en camino.',
                    'type' => 'payment'
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error sending payment notification', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get payment provider based on payment method
     *
     * @param string $paymentMethod
     * @return string
     */
    private function getPaymentProvider(string $paymentMethod): string
    {
        return match($paymentMethod) {
            'visa', 'debit' => 'stripe',
            'paypal' => 'paypal',
            'apple_pay' => 'apple_pay',
            default => 'stripe'
        };
    }
}
