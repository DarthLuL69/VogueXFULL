<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function __construct()
    {
        // Requerir autenticación para crear productos
        $this->middleware('auth:sanctum')->only(['store', 'update', 'destroy']);
    }    public function index(Request $request)
    {
        $query = Product::active();

        // Filtros
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        if ($request->has('subcategory')) {
            $query->bySubcategory($request->subcategory);
        }

        if ($request->has('brand') || $request->has('designer')) {
            $brand = $request->brand ?: $request->designer;
            $query->byBrand($brand);
        }

        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Ordenamiento
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Incluir la información del usuario
        $query->with('user:id,name,email');

        // Paginación
        $perPage = $request->get('per_page', 20);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'last_page' => $products->lastPage(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        Log::info('=== PRODUCT STORE METHOD CALLED ===');
        Log::info('Request method: ' . $request->method());
        Log::info('Request URL: ' . $request->url());
        Log::info('Request data (excluding images): ', $request->except(['images']));

        try {
            // Validación
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'brand' => 'required|string|max:255',
                'description' => 'required|string|min:5',
                'price' => 'required|numeric|min:0',
                'condition' => 'required|string',
                'size' => 'required|string',
                'mainCategory' => 'required|string',
                'subCategory' => 'required|string',
                'finalCategory' => 'required|string',
            ]);

            Log::info('Validation passed successfully');

            // Procesar imágenes
            $imageUrls = [];
            
            for ($i = 0; $i < 10; $i++) {
                if ($request->has("images.{$i}")) {
                    Log::info("Found image {$i}");
                    
                    $base64Image = $request->input("images.{$i}");
                    
                    if (preg_match('/^data:image\/(\w+);base64,/', $base64Image)) {
                        $imageUrl = $this->saveBase64Image($base64Image);
                        if ($imageUrl) {
                            $imageUrls[] = $imageUrl;
                            Log::info("Image {$i} saved successfully: {$imageUrl}");
                        }
                    }
                }
            }

            if (empty($imageUrls)) {
                Log::warning('No images were saved');
                return response()->json([
                    'success' => false,
                    'message' => 'Se requiere al menos una imagen válida'
                ], 422);
            }

            // Buscar o crear category_id basado en main_category
            $categoryId = $this->getOrCreateCategoryId($validated['mainCategory']);

            // Crear producto
            $product = Product::create([
                'name' => $validated['name'],
                'brand' => $validated['brand'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'condition' => $validated['condition'],
                'size' => $validated['size'],
                'main_category' => $validated['mainCategory'],
                'sub_category' => $validated['subCategory'],
                'final_category' => $validated['finalCategory'],
                'images' => $imageUrls,                'image_url' => $imageUrls[0],
                'category_id' => $categoryId,
                'is_active' => true,
                'status' => 'active',
                'user_id' => auth()->id(), // Asignar el ID del usuario autenticado
            ]);

            Log::info('Product created successfully with ID: ' . $product->id);

            return response()->json([
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'data' => $product
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed: ', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Exception in store method: ' . $e->getMessage());
            Log::error('File: ' . $e->getFile() . ' Line: ' . $e->getLine());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }    private function getOrCreateCategoryId($mainCategory)
    {
        // Mapeo de categorías principales a IDs
        $categoryMap = [
            'menswear' => 1,
            'womenswear' => 2,
            'sneakers' => 3,
            'footwear' => 3,
        ];

        $categoryId = $categoryMap[$mainCategory] ?? 1;

        // Verificar si existe, si no, crear
        $category = DB::table('categories')->where('id', $categoryId)->first();
        
        if (!$category) {
            $categoryName = ucfirst($mainCategory);
            $slug = Str::slug($categoryName);
            
            DB::table('categories')->insert([
                'id' => $categoryId,
                'name' => $categoryName,
                'slug' => $slug,
                'description' => 'Categoría ' . $categoryName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return $categoryId;
    }

    private function saveBase64Image($base64String)
    {
        try {
            Log::info('Starting image save process');
            
            if (!preg_match('/^data:image\/(\w+);base64,/', $base64String, $matches)) {
                Log::error('Invalid base64 format');
                return null;
            }
            
            $extension = $matches[1] ?? 'png';
            
            $imageData = preg_replace('/^data:image\/\w+;base64,/', '', $base64String);
            $imageData = base64_decode($imageData);
            
            if ($imageData === false) {
                Log::error('Failed to decode base64');
                return null;
            }
            
            // Crear directorio si no existe
            $productsDir = storage_path('app/public/products');
            if (!file_exists($productsDir)) {
                mkdir($productsDir, 0755, true);
                Log::info('Created products directory');
            }
            
            // Generar nombre único
            $filename = 'products/' . Str::uuid() . '.' . $extension;
            $fullPath = storage_path('app/public/' . $filename);
            
            // Guardar archivo
            $result = file_put_contents($fullPath, $imageData);
            
            if ($result === false) {
                Log::error('Failed to write file');
                return null;
            }
            
            Log::info('File saved successfully');
            return $filename;
            
        } catch (\Exception $e) {
            Log::error('Exception in saveBase64Image: ' . $e->getMessage());
            return null;
        }
    }    public function show(Product $product)
    {
        // Cargar la información del usuario
        $product->load('user:id,name,email');
        
        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'brand' => 'string|max:255',
            'description' => 'string|min:5',
            'price' => 'numeric|min:0',
            'condition' => 'string',
            'size' => 'string',
            'status' => 'in:active,sold,inactive',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado exitosamente',
            'data' => $product
        ]);
    }

    public function destroy(Product $product)
    {
        if ($product->images) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado exitosamente'
        ]);
    }

    public function getBrands()
    {
        $brands = Product::select('brand')
            ->whereNotNull('brand')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand');

        return response()->json([
            'success' => true,
            'data' => $brands
        ]);
    }
}
