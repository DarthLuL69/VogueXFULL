<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Designer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class DesignerController extends Controller
{
    // Constantes para validación
    const URL_RULE = 'nullable|url';
    
    public function index(Request $request)
    {
        Log::info('DesignerController@index called', $request->all());
        
        // Usar caché para las consultas más comunes
        $cacheKey = 'designers_' . md5(json_encode($request->all()));
        $cacheDuration = 60 * 24; // 24 horas en minutos
        
        // Devolver de caché si existe
        if (Cache::has($cacheKey)) {
            Log::info('Returning designers from cache');
            return Cache::get($cacheKey);
        }
        
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

        // Procesar la solicitud y almacenar la respuesta
        $response = $this->processDesignerRequest($request, $query, $perPage);
        
        // Guardar en caché para futuras solicitudes
        Cache::put($cacheKey, $response, $cacheDuration);
        
        return $response;
    }
    
    /**
     * Procesa la solicitud de diseñadores y devuelve la respuesta apropiada
     */
    private function processDesignerRequest($request, $query, $perPage)
    {
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

        // Cuando se solicitan todos los diseñadores (sin paginación)
        if ($request->has('all') && ($request->all === 'true' || $request->all === true)) {
            $designers = $query->orderBy('name')->get();
            
            // Si también se solicita agrupar por letra
            if ($request->has('groupByLetter') && $request->groupByLetter) {
                return $this->groupDesignersByLetter($designers);
            }
            
            // Obtener todas las letras disponibles
            $letters = $designers->map(function($designer) {
                    return $designer->first_letter;
                })
                ->unique()
                ->sort()
                ->values();
                
            // Contar diseñadores por letra
            $letterCounts = [];
            foreach ($letters as $letter) {
                $letterCounts[$letter] = $designers->filter(function($designer) use ($letter) {
                    return $designer->first_letter === $letter;
                })->count();
            }
            
            return response()->json([
                'success' => true,
                'data' => $designers,
                'total' => $designers->count(),
                'available_letters' => $letters,
                'letter_counts' => $letterCounts
            ]);
        }
        
        // Filtrar por letra inicial
        if ($request->has('letter') && !empty($request->letter)) {
            $letter = strtoupper($request->letter);
            
            // Filtrar diseñadores que empiezan con esta letra
            $filteredDesigners = $query->get()->filter(function($designer) use ($letter) {
                return $designer->first_letter === $letter;
            })->values();
            
            return response()->json([
                'success' => true,
                'data' => $filteredDesigners,
                'total' => $filteredDesigners->count(),
                'letter' => $letter
            ]);
        }

        // Organizar por letra para una mejor experiencia de usuario
        if ($request->has('groupByLetter') && $request->groupByLetter) {
            $designers = $query->orderBy('name')->get();
            return $this->groupDesignersByLetter($designers);
        }

        // Paginación predeterminada
        $designers = $query->orderBy('name')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $designers->items(),
            'pagination' => [
                'total' => $designers->total(),
                'per_page' => $designers->perPage(),
                'current_page' => $designers->currentPage(),
                'last_page' => $designers->lastPage()
            ]
        ]);
    }
    
    /**
     * Agrupa los diseñadores por su letra inicial
     */
    private function groupDesignersByLetter($designers)
    {
        $groupedDesigners = [];
        
        foreach ($designers as $designer) {
            $letter = $designer->first_letter;
            if (!isset($groupedDesigners[$letter])) {
                $groupedDesigners[$letter] = [];
            }
            $groupedDesigners[$letter][] = $designer;
        }
        
        // Ordenar las letras alfabéticamente
        ksort($groupedDesigners);
        
        return response()->json([
            'success' => true,
            'data' => $groupedDesigners,
            'total' => $designers->count(),
            'letters' => array_keys($groupedDesigners)
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
        // Usar caché para diseñadores populares
        return Cache::remember('designers_popular', 60 * 24, function () {
            $designers = Designer::where('is_popular', true)
                ->orderBy('items_count', 'desc')
                ->limit(50)
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $designers,
                'total' => $designers->count()
            ]);
        });
    }

    public function featured()
    {
        // Usar caché para diseñadores destacados
        return Cache::remember('designers_featured', 60 * 24, function () {
            $designers = Designer::where('is_featured', true)
                ->orderBy('name')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $designers,
                'total' => $designers->count()
            ]);
        });
    }    public function syncData()
    {
        // Llamar al importador de diseñadores
        $importer = app(\App\Http\Controllers\Api\DesignerImportController::class);
        $result = $importer->importFromGrailed(new Request());
        
        return response()->json([
            'message' => 'Designer data sync completed',
            'result' => $result->getData()
        ]);
    }

    public function scrapeGrailed()
    {
        // Llamar al importador de diseñadores
        $importer = app(\App\Http\Controllers\Api\DesignerImportController::class);
        $result = $importer->importFromGrailed(new Request());
        
        return response()->json([
            'message' => 'Grailed scrape completed',
            'result' => $result
        ]);
    }    /**
     * Verifica y actualiza automáticamente la base de datos de diseñadores si es necesario
     */
    private function checkAndUpdateDesigners()
    {
        // Verificar si es necesario actualizar los diseñadores basado en la última actualización y cantidad
        $designersCount = Designer::count();
        $lastUpdated = cache()->get('designers_last_import');
        $currentTime = now();
        
        // Si hay pocos diseñadores o han pasado más de 7 días desde la última actualización
        if ($designersCount < 100 || !$lastUpdated || $currentTime->diffInDays($lastUpdated) > 7) {
            try {
                // Importar en segundo plano
                dispatch(function () {
                    try {
                        $importer = app(\App\Http\Controllers\Api\DesignerImportController::class);
                        $importer->importFromGrailed(new \Illuminate\Http\Request(['quantity' => 100]));
                        cache()->put('designers_last_import', now(), now()->addDays(7));
                        Log::info('Automatic designer import completed successfully');
                    } catch (\Exception $e) {
                        Log::error('Error in background designer import: ' . $e->getMessage());
                    }
                })->afterResponse();
                
                Log::info('Scheduled automatic designer import');
                return true;
            } catch (\Exception $e) {
                Log::error('Error scheduling designer import: ' . $e->getMessage());
            }
        }
        
        return false;
    }

    /**
     * Endpoint para verificar y actualizar diseñadores si es necesario
     */
    public function checkAndUpdate(Request $request)
    {
        $updated = $this->checkAndUpdateDesigners();
        $count = Designer::count();
        
        return response()->json([
            'success' => true,
            'update_scheduled' => $updated,
            'designers_count' => $count,
            'message' => $updated 
                ? 'Se programó una actualización de diseñadores en segundo plano' 
                : 'No fue necesario actualizar diseñadores'
        ]);
    }
    
    /**
     * Devuelve todas las letras iniciales disponibles para filtrar
     */
    public function letters()
    {
        return Cache::remember('designers_letters', 60 * 24, function () {
            // Obtener las letras iniciales de todos los diseñadores
            $letters = Designer::all()
                ->map(function($designer) {
                    return $designer->first_letter;
                })
                ->unique()
                ->sort()
                ->values();
                
            // Contar diseñadores por letra
            $letterCounts = [];
            foreach ($letters as $letter) {
                $letterCounts[$letter] = Designer::all()->filter(function($designer) use ($letter) {
                    return $designer->first_letter === $letter;
                })->count();
            }
                
            return response()->json([
                'success' => true,
                'data' => $letters,
                'counts' => $letterCounts,
                'total' => $letters->count()
            ]);
        });
    }
}
