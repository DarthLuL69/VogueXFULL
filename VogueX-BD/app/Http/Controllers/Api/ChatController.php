<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    /**
     * Get all chats for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $user = Auth::user();
        $chats = Chat::where('buyer_id', $user->id)
            ->orWhere('seller_id', $user->id)
            ->with(['buyer', 'seller', 'product', 'lastMessage'])
            ->latest('updated_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $chats
        ]);
    }

    /**
     * Create a new chat between buyer and seller for a product
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'seller_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::find($request->product_id);
        
        // Check if seller is actually the owner of the product
        if ($product->user_id != $request->seller_id) {
            return response()->json([
                'success' => false,
                'message' => 'The specified seller is not the owner of this product'
            ], 422);
        }

        // Check if a chat already exists for this buyer, seller, and product
        $existingChat = Chat::where('buyer_id', Auth::id())
            ->where('seller_id', $request->seller_id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingChat) {
            return response()->json([
                'success' => true,
                'message' => 'Chat already exists',
                'data' => $existingChat
            ]);
        }

        $chat = Chat::create([
            'buyer_id' => Auth::id(),
            'seller_id' => $request->seller_id,
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chat created successfully',
            'data' => $chat
        ], 201);
    }

    /**
     * Get a specific chat with its messages
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $user = Auth::user();
        $chat = Chat::with(['messages.sender', 'product', 'buyer', 'seller'])
            ->where('id', $id)
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
        }

        return response()->json([
            'success' => true,
            'data' => $chat
        ]);
    }

    /**
     * Mark a chat as read
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        $chat = Chat::where('id', $id)
            ->where(function($query) use ($user) {
                $query->where('buyer_id', $user->id)
                      ->orWhere('seller_id', $user->id);
            })
            ->first();

        if (!$chat) {
            return response()->json([
                'success' => false,
                'message' => 'Chat not found or you do not have permission to update it'
            ], 404);
        }

        // If user is buyer, mark buyer_read_at, else mark seller_read_at
        if ($chat->buyer_id == $user->id) {
            $chat->buyer_read_at = now();
        } else {
            $chat->seller_read_at = now();
        }

        $chat->save();

        return response()->json([
            'success' => true,
            'message' => 'Chat marked as read',
            'data' => $chat
        ]);
    }

    /**
     * Get unread chat count for the authenticated user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function unreadCount()
    {
        $user = Auth::user();
        
        $buyerUnreadCount = Chat::where('buyer_id', $user->id)
            ->whereNull('buyer_read_at')
            ->orWhere('buyer_read_at', '<', function($query) {
                $query->selectRaw('MAX(created_at) from messages where chat_id = chats.id');
            })
            ->count();
            
        $sellerUnreadCount = Chat::where('seller_id', $user->id)
            ->whereNull('seller_read_at')
            ->orWhere('seller_read_at', '<', function($query) {
                $query->selectRaw('MAX(created_at) from messages where chat_id = chats.id');
            })
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_unread' => $buyerUnreadCount + $sellerUnreadCount,
                'buyer_unread' => $buyerUnreadCount,
                'seller_unread' => $sellerUnreadCount
            ]
        ]);
    }
}
