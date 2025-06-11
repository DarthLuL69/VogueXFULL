<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Designer;
use App\Services\DesignerDataService;
use Illuminate\Http\Request;

class DesignerController extends Controller
{
    protected $designerDataService;

    public function __construct(DesignerDataService $designerDataService)
    {
        $this->designerDataService = $designerDataService;
    }

    public function index(Request $request)
    {
        $query = Designer::query();

        // Filtros
        if ($request->has('popular') && $request->popular) {
            $query->where('is_popular', true);
        }

        if ($request->has('featured') && $request->featured) {
            $query->where('is_featured', true);
        }

        if ($request->has('letter')) {
            $letter = strtoupper($request->letter);
            if ($letter === '#') {
                $query->whereRaw('UPPER(LEFT(name, 1)) NOT REGEXP "[A-Z]"');
            } else {
                $query->whereRaw('UPPER(LEFT(name, 1)) = ?', [$letter]);
            }
        }

        if ($request->has('search')) {
            $query->where('name', 'LIKE', '%' . $request->search . '%');
        }

        if ($request->has('limit')) {
            $query->limit($request->limit);
        }

        $designers = $query->orderBy('name')->get();

        return response()->json([
            'data' => $designers,
            'total' => $designers->count()
        ]);
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
