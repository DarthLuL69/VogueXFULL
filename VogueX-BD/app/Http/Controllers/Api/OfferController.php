<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Offer;
use App\Models\Message;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class OfferController extends Controller
{
    /**
     * Get offers for a specific chat
     *
     * @param  int  $chatId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($chatId)
    {
        $user = Auth::user();
        
        $chat = Chat::where('id', $chatId)
            ->where(function($query) use ($user) {
                $query->where('buyer_id', $user->id)
                      ->orWhere('seller_id', $user->id);
            })
            ->first();

        if (!$chat) {
            return response()->json([
                'success' => false,
                'message' => 'Chat not found or you do not have permission to view it'
            ], 404);
        }        $offers = Offer::where('chat_id', $chatId)
            ->with(['buyer', 'seller', 'product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $offers
        ]);
    }

    /**
     * Create a new offer
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required|exists:chats,id',
            'amount' => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $chat = Chat::with('product')->findOrFail($request->chat_id);

        // Verify the user is part of this chat
        if ($chat->buyer_id != $user->id && $chat->seller_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to send offers in this chat'
            ], 403);
        }

        // Determine if user is buyer or seller
        $isBuyer = ($chat->buyer_id == $user->id);

        // Only buyers should be able to make offers
        if (!$isBuyer) {
            return response()->json([
                'success' => false,
                'message' => 'Only buyers can make offers'
            ], 403);
        }

        // Check if there's already a pending offer
        $pendingOffer = Offer::where('chat_id', $request->chat_id)
            ->whereIn('status', ['pending', 'accepted'])
            ->first();

        if ($pendingOffer) {
            return response()->json([
                'success' => false,
                'message' => 'There is already a pending or accepted offer in this chat'
            ], 409); // Conflict
        }        // Create the offer
        $offer = new Offer();
        $offer->chat_id = $request->chat_id;
        $offer->buyer_id = $user->id;
        $offer->seller_id = $chat->seller_id;
        $offer->amount = $request->amount;
        $offer->status = 'pending';
        $offer->product_id = $chat->product_id;
        $offer->currency = 'EUR';
        $offer->save();        // Create a message in the chat about the offer
        $message = Message::create([
            'chat_id' => $request->chat_id,
            'user_id' => $user->id,
            'type' => 'offer',
            'content' => 'Offer: ' . $request->amount . ' for ' . $chat->product->name
        ]);

        // Update chat timestamp
        $chat->touch();        // Load relationships
        $offer->load(['buyer', 'seller', 'product']);

        return response()->json([
            'success' => true,
            'message' => 'Offer sent successfully',
            'data' => $offer
        ], 201);
    }

    /**
     * Update an offer status (accept or reject)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $offer = Offer::with(['chat', 'product'])->findOrFail($id);        // Check if user is the seller (receiver of the offer)
        if ($offer->seller_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to update this offer'
            ], 403);
        }

        // Check if offer is still pending
        if ($offer->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This offer has already been ' . $offer->status
            ], 409);
        }

        // Update offer status
        $offer->status = $request->status;
        $offer->updated_at = now();
        $offer->save();        // Create a message about the offer status
        $messageContent = 'Offer ' . $request->status . ': ' . $offer->amount . ' for ' . $offer->product->name;
        $message = Message::create([
            'chat_id' => $offer->chat_id,
            'user_id' => $user->id,
            'type' => 'offer_response',
            'content' => $messageContent
        ]);

        // Update chat timestamp
        $chat = $offer->chat;
        $chat->touch();

        return response()->json([
            'success' => true,
            'message' => 'Offer ' . $request->status . ' successfully',
            'data' => $offer,
            'payment_required' => $request->status == 'accepted'
        ]);
    }

    /**
     * Get a specific offer
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = Auth::user();
        $offer = Offer::with(['buyer', 'seller', 'product', 'chat'])->findOrFail($id);
        
        // Check if user is part of the chat this offer belongs to
        $chat = $offer->chat;
        if ($chat->buyer_id != $user->id && $chat->seller_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this offer'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $offer
        ]);
    }
}
