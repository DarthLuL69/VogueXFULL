<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\DesignerController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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

// Ruta para probar la estructura de la tabla
Route::get('/test/products-structure', function () {
    try {
        $columns = Schema::getColumnListing('products');
        $hasTable = Schema::hasTable('products');
        
        $tableInfo = [];
        if ($hasTable) {
            $tableInfo = DB::select("DESCRIBE products");
        }
        
        return response()->json([
            'table_exists' => $hasTable,
            'columns' => $columns,
            'structure' => $tableInfo,
            'message' => $hasTable ? 'Table exists' : 'Table does not exist'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});

// Ruta de prueba para verificar el backend
Route::get('/test/backend', function () {
    return response()->json([
        'message' => 'Backend funcionando correctamente',
        'timestamp' => now(),
        'storage_path' => storage_path('app/public'),
        'storage_exists' => file_exists(storage_path('app/public')),
        'products_dir_exists' => Storage::disk('public')->exists('products'),
    ]);
});

// Ruta de diagnóstico mejorada
Route::get('/test/diagnostic', function () {
    $diagnostics = [
        'timestamp' => now(),
        'php_version' => PHP_VERSION,
        'laravel_version' => app()->version(),
        'storage_path' => storage_path('app/public'),
        'storage_exists' => file_exists(storage_path('app/public')),
        'storage_writable' => is_writable(storage_path('app/public')),
        'products_dir_exists' => Storage::disk('public')->exists('products'),
        'log_file_exists' => file_exists(storage_path('logs/laravel.log')),
        'log_writable' => is_writable(storage_path('logs')),
        'symlink_exists' => is_link(public_path('storage')),
        'symlink_target' => is_link(public_path('storage')) ? readlink(public_path('storage')) : null,
    ];
    
    // Intentar crear directorio de productos si no existe
    try {
        if (!Storage::disk('public')->exists('products')) {
            Storage::disk('public')->makeDirectory('products');
            $diagnostics['products_dir_created'] = true;
        }
    } catch (\Exception $e) {
        $diagnostics['products_dir_error'] = $e->getMessage();
    }
    
    return response()->json($diagnostics);
});

// Ruta de prueba simple para crear producto
Route::post('/test/simple-product', function (Request $request) {
    try {
        Log::info('Test product creation started');
        
        $product = \App\Models\Product::create([
            'name' => 'Test Product',
            'brand' => 'Test Brand',
            'description' => 'Test description for debugging',
            'price' => 99.99,
            'condition' => 'good',
            'size' => 'M',
            'main_category' => 'test',
            'sub_category' => 'test',
            'final_category' => 'test',
            'images' => ['test-image.jpg'],
            'image_url' => 'test-image.jpg',
            'category_id' => 1,
            'is_active' => true,
            'status' => 'active',
        ]);
        
        Log::info('Test product created successfully', ['product_id' => $product->id]);
        
        return response()->json([
            'success' => true,
            'message' => 'Test product created successfully',
            'product' => $product
        ]);
    } catch (\Exception $e) {
        Log::error('Test product creation failed', [
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]);
        
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
});

// Ruta de prueba simple para el controlador
Route::post('/test/product-controller', [App\Http\Controllers\Api\ProductController::class, 'store']);

// Ruta para probar datos de formulario
Route::post('/test/form-data', function(Request $request) {
    Log::info('Test form data received');
    Log::info('All request data: ', $request->all());
    Log::info('Request method: ' . $request->method());
    Log::info('Content type: ' . $request->header('Content-Type'));
    
    return response()->json([
        'received_data' => $request->all(),
        'method' => $request->method(),
        'content_type' => $request->header('Content-Type')
    ]);
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
    Route::get('/{designer}', [DesignerController::class, 'show']);
});

// Rutas de usuario
Route::prefix('user')->group(function () {
    Route::get('/profile', [UserController::class, 'getProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
});

// Ruta de debug para designers
Route::get('/test/designers', function () {
    try {
        $designersCount = DB::table('designers')->count();
        $designers = DB::table('designers')->limit(5)->get();
        
        return response()->json([
            'designers_table_exists' => Schema::hasTable('designers'),
            'designers_count' => $designersCount,
            'sample_designers' => $designers,
            'all_tables' => Schema::getConnection()->getDoctrineSchemaManager()->listTableNames()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Ruta para ejecutar el scraper de Grailed
Route::post('/designers/scrape-grailed', function () {
    try {
        $scraperService = app(\App\Services\GrailedScraperService::class);
        $result = $scraperService->scrapeAllDesigners();
        
        return response()->json([
            'success' => true,
            'message' => 'Grailed scrape completed successfully',
            'data' => $result
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error during scraping: ' . $e->getMessage()
        ], 500);
    }
});

// Ruta para scraper de página de diseñadores
Route::post('/designers/scrape-page', function () {
    try {
        $scraperService = app(\App\Services\GrailedDesignerPageScraper::class);
        $result = $scraperService->scrapeAllDesigners();
        
        return response()->json([
            'success' => true,
            'message' => 'Designer page scrape completed successfully',
            'data' => $result
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error during scraping: ' . $e->getMessage()
        ], 500);
    }
});

// Ruta de test para verificar la API de Grailed
Route::get('/test/grailed-api', function () {
    try {
        $grailedApi = app(\App\Services\GrailedApiService::class);
        $response = $grailedApi->search('nike', 1, 10);
        
        return response()->json([
            'success' => true,
            'has_response' => !empty($response),
            'has_hits' => isset($response['hits']),
            'hits_count' => isset($response['hits']) ? count($response['hits']) : 0,
            'sample_hit' => isset($response['hits'][0]) ? $response['hits'][0] : null,
            'response_keys' => is_array($response) ? array_keys($response) : 'not_array'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Ruta de test para contar diseñadores
Route::get('/test/designers-count', function () {
    try {
        $total = \App\Models\Designer::count();
        $popular = \App\Models\Designer::where('is_popular', true)->count();
        $featured = \App\Models\Designer::where('is_featured', true)->count();
        
        $sampleDesigners = \App\Models\Designer::orderBy('name')->limit(10)->pluck('name');
        
        return response()->json([
            'total_designers' => $total,
            'popular_designers' => $popular,
            'featured_designers' => $featured,
            'sample_designers' => $sampleDesigners,
            'letters_with_designers' => \DB::select("
                SELECT LEFT(UPPER(name), 1) as letter, COUNT(*) as count 
                FROM designers 
                GROUP BY LEFT(UPPER(name), 1) 
                ORDER BY letter
            ")
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage()
        ], 500);
    }
});
