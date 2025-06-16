<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\DesignerController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactMessageController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas de productos
Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);
    Route::get('/brands', [ProductController::class, 'getBrands']);
    Route::get('/{product}', [ProductController::class, 'show']);
    Route::put('/{product}', [ProductController::class, 'update']);
    Route::delete('/{product}', [ProductController::class, 'destroy']);
});

// Rutas de diseñadores
Route::prefix('designers')->group(function () {
    Route::get('/', [DesignerController::class, 'index']);
    Route::get('/popular', [DesignerController::class, 'popular']);
    Route::get('/featured', [DesignerController::class, 'featured']);
    Route::get('/check-update', [DesignerController::class, 'checkAndUpdate']);
    Route::get('/letters', [DesignerController::class, 'letters']);
    Route::get('/statistics', [\App\Http\Controllers\Api\DesignerImportController::class, 'getStatistics']);
    Route::get('/{designer}', [DesignerController::class, 'show']);
});

// Rutas de diseñadores - importación
Route::post('/designers/import', [\App\Http\Controllers\Api\DesignerImportController::class, 'importFromGrailed']);
Route::get('/designers/import', [\App\Http\Controllers\Api\DesignerImportController::class, 'importFromGrailed']);
Route::get('/designers/import-from-file', [\App\Http\Controllers\Api\DesignerImportController::class, 'importFromFile']);

// Rutas de autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas para noticias
Route::get('/news/latest', [\App\Http\Controllers\Api\NewsController::class, 'latest']);

// Contact form route (public)
Route::post('/contact', [ContactMessageController::class, 'store']);

// Rutas protegidas por autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Rutas de usuario
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'getProfile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::post('/avatar', [UserController::class, 'uploadAvatar']);
    });
    
    // Chat routes
    Route::get('/chats', [\App\Http\Controllers\Api\ChatController::class, 'index']);
    Route::post('/chats', [\App\Http\Controllers\Api\ChatController::class, 'store']);
    Route::get('/chats/{id}', [\App\Http\Controllers\Api\ChatController::class, 'show']);
    Route::patch('/chats/{id}/read', [\App\Http\Controllers\Api\ChatController::class, 'markAsRead']);
    Route::get('/chats/unread/count', [\App\Http\Controllers\Api\ChatController::class, 'unreadCount']);
    
    // Message routes
    Route::get('/chats/{chatId}/messages', [\App\Http\Controllers\Api\MessageController::class, 'index']);
    Route::post('/messages', [\App\Http\Controllers\Api\MessageController::class, 'store']);
    
    // Offer routes
    Route::get('/chats/{chatId}/offers', [\App\Http\Controllers\Api\OfferController::class, 'index']);
    Route::post('/offers', [\App\Http\Controllers\Api\OfferController::class, 'store']);
    Route::get('/offers/{id}', [\App\Http\Controllers\Api\OfferController::class, 'show']);
    Route::patch('/offers/{id}', [\App\Http\Controllers\Api\OfferController::class, 'update']);
    
    // Order routes
    Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
    Route::get('/orders/{id}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
    Route::patch('/orders/{id}/status', [\App\Http\Controllers\Api\OrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/cancel', [\App\Http\Controllers\Api\OrderController::class, 'cancel']);
    
    // Payment routes
    Route::post('/payments/initialize', [PaymentController::class, 'initialize']);
    Route::post('/payments/process', [PaymentController::class, 'process']);
    
    // Rutas para administradores
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json([
                'success' => true,
                'message' => 'Bienvenido al panel de administración',
                'data' => [
                    'stats' => [
                        'total_users' => \App\Models\User::count(),
                        'total_products' => \App\Models\Product::count(),
                        'total_designers' => \App\Models\Designer::count(),
                        'total_messages' => \App\Models\ContactMessage::count(),
                        'unread_messages' => \App\Models\ContactMessage::where('is_read', false)->count(),
                    ]
                ]
            ]);
        });
        
        // Contact Messages Routes (Admin only)
        Route::get('/contact-messages', [ContactMessageController::class, 'index']);
        Route::get('/contact-messages/{id}', [ContactMessageController::class, 'show']);
        Route::patch('/contact-messages/{id}/read', [ContactMessageController::class, 'markAsRead']);
        Route::patch('/contact-messages/{id}/unread', [ContactMessageController::class, 'markAsUnread']);
        Route::delete('/contact-messages/{id}', [ContactMessageController::class, 'destroy']);
        Route::get('/contact-messages/stats/overview', [ContactMessageController::class, 'stats']);
        
        // Admin Order routes
        Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'index']);
        Route::get('/orders/{id}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
        Route::post('/orders/process-payment', [\App\Http\Controllers\Api\OrderController::class, 'processPayment']);
        Route::patch('/orders/{id}/cancel', [\App\Http\Controllers\Api\OrderController::class, 'cancel']);
        Route::patch('/orders/{id}/status', [\App\Http\Controllers\Api\OrderController::class, 'updateStatus']);
    });
});
