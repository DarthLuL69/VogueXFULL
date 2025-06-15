<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GrailedDesignerBatchImporter;
use App\Services\GrailedApiService;
use App\Models\Designer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class DesignerImportController extends Controller
{
    /**
     * Importa diseñadores desde la API de Grailed
     */
    public function importFromGrailed(Request $request)
    {
        try {
            $quantity = $request->input('quantity', 1000);
            
            Log::info("Iniciando importación masiva de {$quantity} diseñadores");
            
            // Aumentar tiempo máximo de ejecución para procesos largos
            ini_set('max_execution_time', 300); // 5 minutos
            
            // Registrar hora de inicio
            $startTime = microtime(true);
            
            // Create the API service and importer
            $apiService = new GrailedApiService();
            $importer = new GrailedDesignerBatchImporter($apiService);
            
            // Ejecutar la importación dentro de una transacción
            DB::beginTransaction();
            
            try {
                $result = $importer->importDesigners($quantity);
                DB::commit();
            } catch (QueryException $e) {
                DB::rollBack();
                throw new \Exception('Error de base de datos: ' . $e->getMessage());
            }
            
            // Calcular tiempo de ejecución
            $executionTime = round(microtime(true) - $startTime, 2);
            
            return response()->json([
                'success' => true,
                'message' => "Importación de diseñadores completada en {$executionTime} segundos",
                'data' => $result,
                'total_designers' => Designer::count()
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error en importación de diseñadores: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error durante la importación: ' . $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'total_designers' => Designer::count()
            ], 500);
        }
    }
    
    /**
     * Obtener estadísticas de diseñadores
     */
    public function getStatistics()
    {
        try {
            $total = Designer::count();
            $popular = Designer::where('is_popular', true)->count();
            $featured = Designer::where('is_featured', true)->count();
            $withImages = Designer::whereNotNull('image_url')
                            ->where('image_url', '!=', '')
                            ->count();
            
            $categoryCounts = [];
            $designers = Designer::all();
            
            foreach ($designers as $designer) {
                $categories = $designer->categories ?? [];
                foreach ($categories as $category) {
                    if (!isset($categoryCounts[$category])) {
                        $categoryCounts[$category] = 0;
                    }
                    $categoryCounts[$category]++;
                }
            }
            
            // Ordenar categorías por cantidad
            arsort($categoryCounts);
              // Obtener distribución de letras iniciales
            $letterDistribution = DB::select("
                SELECT LEFT(UPPER(name), 1) as letter, COUNT(*) as count 
                FROM designers 
                GROUP BY LEFT(UPPER(name), 1) 
                ORDER BY letter
            ");
            
            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'popular' => $popular,
                    'featured' => $featured,
                    'with_images' => $withImages,
                    'without_images' => $total - $withImages,
                    'category_distribution' => $categoryCounts,
                    'letter_distribution' => $letterDistribution
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error obteniendo estadísticas: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Importa diseñadores desde un archivo de texto local
     */
    public function importFromFile()
    {
        try {
            // Registrar hora de inicio
            $startTime = microtime(true);
            
            // Ruta al archivo de diseñadores
            $filePath = base_path('../DISEÑADORES.txt');
            
            if (!file_exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El archivo de diseñadores no existe',
                    'path' => $filePath
                ], 404);
            }
            
            // Leer el archivo
            $designers = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            
            Log::info("Iniciando importación de " . count($designers) . " diseñadores desde archivo local");
            
            $processed = 0;
            $created = 0;
            $updated = 0;
            $errors = 0;
            
            // Ejecutar la importación dentro de una transacción
            DB::beginTransaction();
            
            try {
                // Obtener diseñadores existentes para evitar duplicados
                $existingDesigners = Designer::pluck('name')->toArray();
                $existingDesigners = array_map('strtolower', $existingDesigners);
                
                foreach ($designers as $designerName) {
                    $processed++;
                    
                    // Omitir líneas vacías
                    if (empty(trim($designerName))) {
                        continue;
                    }
                    
                    // Verificar si ya existe (independientemente de mayúsculas/minúsculas)
                    if (in_array(strtolower($designerName), $existingDesigners)) {
                        $updated++;
                        continue;
                    }
                    
                    try {
                        // Crear nuevo diseñador
                        Designer::create([
                            'name' => $designerName,
                            'slug' => \Illuminate\Support\Str::slug($designerName),
                            'description' => 'Diseñador de moda',
                            'is_popular' => false,
                            'is_featured' => false,
                            'categories' => ['moda'],
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                        
                        $created++;
                        $existingDesigners[] = strtolower($designerName);
                        
                    } catch (\Exception $e) {
                        Log::error("Error al crear diseñador {$designerName}: " . $e->getMessage());
                        $errors++;
                    }
                }
                
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw new \Exception('Error de base de datos: ' . $e->getMessage());
            }
            
            // Calcular tiempo de ejecución
            $executionTime = round(microtime(true) - $startTime, 2);
            
            return response()->json([
                'success' => true,
                'message' => "Importación de diseñadores completada en {$executionTime} segundos",
                'data' => [
                    'processed' => $processed,
                    'created' => $created,
                    'updated' => $updated,
                    'errors' => $errors,
                    'total_designers' => Designer::count()
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error("Error en importación de diseñadores desde archivo: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error durante la importación: ' . $e->getMessage(),
                'error_trace' => $e->getTraceAsString(),
                'total_designers' => Designer::count()
            ], 500);
        }
    }
}
