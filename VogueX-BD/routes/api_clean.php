<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\DesignerController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\AuthController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('/products/brands', [ProductController::class, 'getBrands']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
});

// Designer routes
Route::prefix('designers')->group(function () {
    Route::get('/', [DesignerController::class, 'index']);
    Route::get('/check-update', [DesignerController::class, 'checkAndUpdate']);
    Route::get('/{designer}', [DesignerController::class, 'show']);
});

// User routes
Route::prefix('user')->group(function () {
    Route::get('/profile', [UserController::class, 'getProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::post('/profile/avatar', [UserController::class, 'uploadAvatar']);
});

// Chat routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('chats')->group(function () {
        Route::get('/', [ChatController::class, 'index']);
        Route::post('/', [ChatController::class, 'store']);
        Route::get('/{chat}', [ChatController::class, 'show']);
        Route::patch('/{chat}/read', [ChatController::class, 'markAsRead']);
        Route::get('/unread/count', [ChatController::class, 'getUnreadCount']);
        
        // Messages
        Route::get('/{chat}/messages', [MessageController::class, 'index']);
        Route::post('/{chat}/messages', [MessageController::class, 'store']);
        
        // Offers
        Route::get('/{chat}/offers', [OfferController::class, 'index']);
        Route::post('/offers', [OfferController::class, 'store']);
        Route::patch('/offers/{offer}/accept', [OfferController::class, 'accept']);
        Route::patch('/offers/{offer}/reject', [OfferController::class, 'reject']);
    });
});
