<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Designer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DesignerController extends Controller
{
    public function index(Request $request)
    {
        Log::info('DesignerController@index called', $request->all());
        
        $query = Designer::query();

        // Filtros
        if ($request->has('popular') && $request->popular) {
            $query->where('is_popular', true);
        }

        if ($request->has('featured') && $request->featured) {
            $query->where('is_featured', true);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'LIKE', '%' . $search . '%');
            Log::info('Searching designers with term: ' . $search);
        }

        // Paginación mejorada
        $perPage = $request->get('per_page', 50); // Aumentar por defecto
        $maxPerPage = $request->get('limit', 100); // Límite máximo
        
        if ($maxPerPage && $maxPerPage <= 500) {
            $perPage = $maxPerPage;
        }

        // Si hay búsqueda, no paginar para el autocompletado
        if ($request->has('search') && $request->has('limit')) {
            $designers = $query->orderBy('name')
                ->limit($request->limit)
                ->get();
            
            Log::info('Search results count: ' . $designers->count());

            return response()->json([
                'success' => true,
                'data' => $designers,
                'total' => $designers->count()
            ]);
        }

        // Paginación normal
        if ($request->has('all') && $request->all === 'true') {
            // Devolver todos los diseñadores (con límite de seguridad)
            $designers = $query->orderBy('name')->limit(2500)->get();
        } else {
            // Paginación estándar
            $designers = $query->orderBy('name')->paginate($perPage);
        }
        
        Log::info('Total designers in response: ' . $designers->count());

        if ($designers instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            return response()->json([
                'success' => true,
                'data' => $designers->items(),
                'total' => $designers->total(),
                'current_page' => $designers->currentPage(),
                'last_page' => $designers->lastPage(),
                'per_page' => $designers->perPage()
            ]);
        } else {
            return response()->json([
                'success' => true,
                'data' => $designers,
                'total' => $designers->count()
            ]);
        }
    }

    public function show($id)
    {
        $designer = Designer::with('products')->findOrFail($id);
        return response()->json($designer);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:designers',
            'image_url' => 'nullable|url',
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'is_popular' => 'boolean',
            'is_featured' => 'boolean',
            'categories' => 'nullable|array'
        ]);

        $designer = Designer::create($validated);
        return response()->json($designer, 201);
    }

    public function update(Request $request, Designer $designer)
    {
        $validated = $request->validate([
            'name' => 'string|max:255|unique:designers,name,' . $designer->id,
            'image_url' => 'nullable|url',
            'description' => 'nullable|string',
            'website' => 'nullable|url',
            'is_popular' => 'boolean',
            'is_featured' => 'boolean',
            'categories' => 'nullable|array'
        ]);

        $designer->update($validated);
        return response()->json($designer);
    }

    public function destroy(Designer $designer)
    {
        $designer->delete();
        return response()->json(null, 204);
    }

    public function popular()
    {
        $designers = Designer::where('is_popular', true)
            ->orderBy('items_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'data' => $designers
        ]);
    }

    public function featured()
    {
        $designers = Designer::where('is_featured', true)
            ->orderBy('items_count', 'desc')
            ->limit(6)
            ->get();

        return response()->json([
            'data' => $designers
        ]);
    }

    public function syncData()
    {
        $this->designerDataService->syncDesignersFromExternalSources();
        
        return response()->json([
            'message' => 'Designer data sync completed'
        ]);
    }

    public function scrapeGrailed()
    {
        $scraperService = app(GrailedScraperService::class);
        $result = $scraperService->scrapeAllDesigners();
        
        return response()->json([
            'message' => 'Grailed scrape completed',
            'result' => $result
        ]);
    }
}
