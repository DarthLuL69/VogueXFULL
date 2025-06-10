<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SearchHistoryController;
use App\Http\Controllers\Api\StockXController;

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

// Rutas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', OrderController::class);
    
    // Nueva ruta para obtener el perfil del usuario autenticado
    Route::get('/profile', function (Request $request) {
        return $request->user();
    });
});

// Rutas públicas
Route::apiResource('search-history', SearchHistoryController::class);
Route::get('products/search', [ProductController::class, 'search']);

// Test CORS route
Route::get('/test-cors', function () {
    return response()->json([
        'message' => 'CORS está funcionando correctamente',
        'timestamp' => now()
    ]);
});

// StockX API Routes
Route::prefix('stockx')->group(function () {
    Route::get('/search', [StockXController::class, 'searchProducts']);
    Route::get('/price-recommendation', [StockXController::class, 'getPriceRecommendation']);
    Route::get('/price', [StockXController::class, 'getProductPrice']);
    Route::get('/market-data', [StockXController::class, 'getMarketData']);
    Route::get('/brands', [StockXController::class, 'getBrands']);
});
