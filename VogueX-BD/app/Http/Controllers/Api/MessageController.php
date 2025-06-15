<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Events\NewMessage;

class MessageController extends Controller
{
    /**
     * Get messages for a specific chat
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
        }        $messages = Message::where('chat_id', $chatId)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages
        ]);
    }

    /**
     * Send a new message in a chat
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'chat_id' => 'required|exists:chats,id',
            'content' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $chat = Chat::findOrFail($request->chat_id);

        // Verify the user is part of this chat
        if ($chat->buyer_id != $user->id && $chat->seller_id != $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to send messages in this chat'
            ], 403);
        }        $message = Message::create([
            'chat_id' => $request->chat_id,
            'user_id' => $user->id,
            'content' => $request->content,
            'type' => 'text'
        ]);

        // Update the chat's updated_at timestamp
        $chat->touch();
        
        // Mark the sender's side as read
        if ($chat->buyer_id == $user->id) {
            $chat->buyer_read_at = now();
        } else {
            $chat->seller_read_at = now();
        }
        
        $chat->save();        // Load the sender relationship for the message
        $message->load('user');

        // Broadcast the new message (would require setting up Laravel Echo Server)
        // event(new NewMessage($message));

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => $message
        ], 201);
    }
}
