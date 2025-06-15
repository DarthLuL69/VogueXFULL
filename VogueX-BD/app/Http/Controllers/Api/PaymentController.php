<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use App\Models\Payment;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Initialize a payment after an offer is accepted
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function initializePayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'offer_id' => 'required|exists:offers,id',
            'payment_method' => 'required|in:visa,debit,apple_pay,paypal',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $offer = Offer::with(['chat', 'product'])->findOrFail($request->offer_id);

        // Check if user is the buyer (only buyers can make payments)
        if ($offer->chat->buyer_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the buyer can make payments'
            ], 403);
        }

        // Check if offer status is accepted
        if ($offer->status !== 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'Payment can only be initiated for accepted offers'
            ], 400);
        }

        // Check if payment already exists for this offer
        $existingPayment = Payment::where('offer_id', $request->offer_id)->first();
        if ($existingPayment) {
            return response()->json([
                'success' => false,
                'message' => 'A payment for this offer already exists',
                'data' => $existingPayment
            ], 409);
        }

        // Create a payment record
        $payment = Payment::create([
            'offer_id' => $request->offer_id,
            'user_id' => $user->id,
            'amount' => $offer->amount,
            'payment_method' => $request->payment_method,
            'status' => 'pending',
            'transaction_id' => Str::uuid()->toString(),
        ]);

        // In a real application, you would integrate with a payment gateway here
        // For now, we'll simulate payment processing

        // Create a payment link (in a real app, this would be the payment gateway URL)
        $paymentLink = url('/api/payments/process/' . $payment->id);
        
        return response()->json([
            'success' => true,
            'message' => 'Payment initialized successfully',
            'data' => [
                'payment' => $payment,
                'payment_link' => $paymentLink
            ]
        ]);
    }

    /**
     * Process a payment (simulate payment gateway callback)
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function processPayment($id)
    {
        $payment = Payment::with(['offer', 'offer.chat'])->findOrFail($id);
        
        // In a real application, this would be handled by a payment gateway callback
        // For now, we'll simulate a successful payment
        
        // Update payment status
        $payment->status = 'completed';
        $payment->paid_at = now();
        $payment->save();
        
        // Create a message about the payment
        $chat = $payment->offer->chat;
        $message = Message::create([
            'chat_id' => $chat->id,
            'sender_id' => $payment->user_id,
            'type' => 'payment',
            'content' => 'Payment of ' . $payment->amount . ' completed successfully',
        ]);
        
        // Update chat timestamp
        $chat->touch();
        
        return response()->json([
            'success' => true,
            'message' => 'Payment processed successfully',
            'data' => $payment
        ]);
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
    }
}
