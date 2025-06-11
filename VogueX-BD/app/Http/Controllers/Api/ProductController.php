<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Designer;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $products = Product::with('category')->get();
        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'brand' => 'nullable|string|max:255',
            'size' => 'nullable|string|max:50',
            'condition' => 'nullable|in:new,like_new,excellent,good,fair',
            'original_price' => 'nullable|numeric|min:0',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        // Buscar o crear diseñador por nombre de marca
        $designer = null;
        if (!empty($validated['brand'])) {
            $designer = Designer::firstOrCreate(
                ['name' => $validated['brand']],
                [
                    'slug' => Str::slug($validated['brand']),
                    'description' => "Fashion brand: {$validated['brand']}",
                    'is_popular' => false,
                    'is_featured' => false,
                    'items_count' => 0
                ]
            );
            $validated['designer_id'] = $designer->id;
        }

        // Crear el producto
        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'designer_id' => $validated['designer_id'] ?? null,
            'is_active' => true
        ]);

        // Procesar y guardar las imágenes
        if ($request->hasFile('images')) {
            $imageUrls = [];
            foreach ($request->file('images') as $image) {
                $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('products', $filename, 'public');
                $imageUrls[] = Storage::url($path);
            }
            
            // Guardar las URLs de las imágenes en el producto
            $product->image_url = $imageUrls[0]; // Primera imagen como principal
            $product->images = $imageUrls; // Todas las imágenes
            $product->save();
        }

        return response()->json($product->load(['category', 'designer']), 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'category_id' => 'exists:categories,id',
            'is_active' => 'boolean',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $product->update($validated);

        // Procesar nuevas imágenes si se proporcionan
        if ($request->hasFile('images')) {
            // Eliminar imágenes antiguas
            if ($product->images) {
                foreach ($product->images as $oldImage) {
                    $path = str_replace('/storage/', '', $oldImage);
                    Storage::disk('public')->delete($path);
                }
            }

            $imageUrls = [];
            foreach ($request->file('images') as $image) {
                $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs('products', $filename, 'public');
                $imageUrls[] = Storage::url($path);
            }
            
            $product->image_url = $imageUrls[0];
            $product->images = $imageUrls;
            $product->save();
        }

        return response()->json($product);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Product $product)
    {
        // Eliminar imágenes
        if ($product->images) {
            foreach ($product->images as $image) {
                $path = str_replace('/storage/', '', $image);
                Storage::disk('public')->delete($path);
            }
        }

        $product->delete();
        return response()->json(null, 204);
    }

    public function search(Request $request)
    {
        $query = $request->get('q');
        $designer = $request->get('designer');
        $category = $request->get('category');
        $minPrice = $request->get('min_price');
        $maxPrice = $request->get('max_price');
        $condition = $request->get('condition');
        
        $products = Product::query()->where('is_active', true);

        if (!empty($query)) {
            $products->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('brand', 'LIKE', "%{$query}%");
            });
        }

        if (!empty($designer)) {
            $products->whereHas('designer', function($q) use ($designer) {
                $q->where('name', 'LIKE', "%{$designer}%");
            });
        }

        if (!empty($category)) {
            $products->where('category_id', $category);
        }

        if (!empty($minPrice)) {
            $products->where('price', '>=', $minPrice);
        }

        if (!empty($maxPrice)) {
            $products->where('price', '<=', $maxPrice);
        }

        if (!empty($condition)) {
            $products->where('condition', $condition);
        }

        $products = $products->with(['category', 'designer'])
                           ->orderBy('created_at', 'desc')
                           ->paginate(20);

        return response()->json($products);
    }

    public function getBrands(Request $request)
    {
        $query = $request->get('q', '');
        
        $brands = Designer::where('name', 'LIKE', "%{$query}%")
                         ->orderBy('items_count', 'desc')
                         ->orderBy('name')
                         ->limit(10)
                         ->get(['id', 'name', 'items_count']);

        return response()->json($brands);
    }
}
