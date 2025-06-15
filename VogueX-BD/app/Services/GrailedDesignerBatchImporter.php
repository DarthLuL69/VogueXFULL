<?php

namespace App\Services;

use App\Models\Designer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GrailedDesignerBatchImporter
{    protected $apiService;
    protected $batchSize = 100;
    protected $maxBatches = 10; // 10 batches * 100 items = 1000 diseñadores
    protected $designerCache = [];
    protected $processedCount = 0;
    protected $createdCount = 0;
    protected $updatedCount = 0;
    protected $errorCount = 0;
    
    public function __construct($apiService)
    {
        $this->apiService = $apiService;
    }
      /**
     * Importa diseñadores desde la API de Grailed
     * 
     * @param int $limit Número máximo de diseñadores a importar
     * @return array Resultados de la importación
     */
    public function importDesigners($limit = 1000)
    {
        $this->logInfo('Iniciando importación masiva de diseñadores desde Grailed API');
        
        // Primero cargar todos los diseñadores existentes en un caché para
        // evitar consultas repetitivas a la base de datos
        $this->preloadDesignerCache();
        
        // Usaremos diferentes términos de búsqueda para diversificar los resultados
        $searchTerms = [
            'designer', 'brand', 'fashion', 'luxury', 'clothes',
            'streetwear', 'vintage', 'couture', 'apparel', 'menswear', 
            'womenswear', 'collection', 'runway', 'style', 'jacket',
            'shirt', 'pants', 'shoes', 'sneakers', 'accessories', 
            'denim', 'leather', 'cashmere', 'silk', 'tailoring'
        ];
        
        // Combinar con letras del alfabeto para más variedad
        $alphabet = range('a', 'z');
        foreach ($alphabet as $letter) {
            $searchTerms[] = "brand {$letter}";
            $searchTerms[] = "designer {$letter}";
        }
        
        shuffle($searchTerms); // Aleatorizar términos para diversificar resultados
        
        $batchesProcessed = 0;
        
        foreach ($searchTerms as $term) {        if ($batchesProcessed >= $this->maxBatches || $this->processedCount >= $limit) {
                $this->logInfo("Se alcanzó el límite de importación: {$this->processedCount}/{$limit} diseñadores");
                break;
            }
            
            $this->logInfo("Procesando búsqueda para término: {$term}");
            
            try {
                $results = $this->apiService->search($term, 1, $this->batchSize);
                
                if (empty($results) || empty($results['hits'])) {
                    $this->logInfo("No se encontraron resultados para: {$term}");
                    continue;
                }
                
                $this->logInfo("Encontrados {$this->batchSize} resultados para: {$term}");
                
                // Extraer y procesar diseñadores de los resultados
                $this->extractDesignersFromResults($results['hits']);
                
                $batchesProcessed++;
                $this->logInfo("Procesado lote {$batchesProcessed}/{$this->maxBatches}");
                
                // Esperar brevemente entre solicitudes para no sobrecargar la API
                sleep(2);
                
            } catch (\Exception $e) {
                $this->logError("Error al procesar término {$term}: " . $e->getMessage());
                $this->errorCount++;
                continue;
            }
        }
        
        $this->logInfo("Importación finalizada: procesados {$this->processedCount}, creados {$this->createdCount}, actualizados {$this->updatedCount}, errores {$this->errorCount}");
        
        return [
            'processed' => $this->processedCount,
            'created' => $this->createdCount,
            'updated' => $this->updatedCount,
            'errors' => $this->errorCount,
            'total_designers' => Designer::count()
        ];
    }
    
    /**
     * Extrae nombres de diseñadores de los resultados de búsqueda y los guarda en la BD
     */
    protected function extractDesignersFromResults(array $hits)
    {
        $designerNames = [];
        
        // Extraer nombres de diseñadores únicos
        foreach ($hits as $hit) {
            // Intentamos extraer el diseñador de varios campos posibles
            $designerName = $hit['designer'] ?? $hit['brand'] ?? null;
            
            if (!$designerName) {
                // Intentar extraer del título
                $title = $hit['title'] ?? $hit['name'] ?? '';
                if (strpos($title, ' by ') !== false) {
                    $parts = explode(' by ', $title);
                    $designerName = trim($parts[1]);
                } elseif (strpos($title, ' - ') !== false) {
                    $parts = explode(' - ', $title);
                    $designerName = trim($parts[0]);
                }
            }
            
            // Si tenemos un nombre de diseñador y es válido
            if ($designerName && $this->isValidDesignerName($designerName)) {
                $designerNames[$designerName] = $hit; // Guardar el hit para más info
            }
        }
        
        $this->logInfo("Extrajeron " . count($designerNames) . " nombres de diseñadores únicos");
        
        // Guardar cada diseñador en la base de datos
        foreach ($designerNames as $name => $hit) {
            $this->processedCount++;
            $this->saveDesigner($name, $hit);
        }
    }
    
    /**
     * Guarda o actualiza un diseñador en la base de datos
     */
    protected function saveDesigner(string $name, array $hit = [])
    {
        // No procesar si ya está en caché y ya fue procesado
        if (isset($this->designerCache[strtolower($name)])) {
            return;
        }
        
        try {
            // Verificar si el diseñador ya existe
            $slug = Str::slug($name);
            $designer = Designer::where('slug', $slug)->first();
            
            if ($designer) {
                // Actualizar si hay información adicional
                $designer->items_count = $designer->items_count + 1;
                $designer->save();
                $this->updatedCount++;
                $this->designerCache[strtolower($name)] = true;
                return;
            }
            
            // Crear nuevo diseñador
            $imageUrl = $hit['image_url'] ?? $hit['photo_url'] ?? $this->generateDefaultImage($name);
            
            $designer = Designer::create([
                'name' => $name,
                'slug' => $slug,
                'image_url' => $imageUrl,
                'description' => $this->generateDescription($name, $hit),
                'website' => null,
                'is_popular' => false,
                'is_featured' => false,
                'items_count' => 1,
                'categories' => $this->extractCategories($hit)
            ]);
            
            $this->createdCount++;
            $this->designerCache[strtolower($name)] = true;
            
        } catch (\Exception $e) {
            $this->logError("Error guardando diseñador '{$name}': " . $e->getMessage());
            $this->errorCount++;
        }
    }
    
    /**
     * Verifica si un nombre de diseñador es válido
     */
    protected function isValidDesignerName(string $name)
    {
        // Nombre demasiado corto
        if (strlen($name) < 2) {
            return false;
        }
        
        // Nombres que son solo números o caracteres especiales
        if (preg_match('/^[0-9\W]+$/', $name)) {
            return false;
        }
        
        // Palabras que indican que no es un diseñador
        $invalidWords = [
            't-shirt', 'shirt', 'pants', 'jeans', 'jacket', 'tee', 'hoodie',
            'shoes', 'hat', 'cap', 'sneakers', 'boots', 'socks', 'clothing',
            'men', 'women', 'kids', 'apparel', 'wear', 'one size', 'worldwide',
            'limited', 'editions', 'design', 'official', 'authentic', 'fake',
            'made in', 'sz', 'size', 'free shipping', 'sale', 'cheap', 'best',
            'top', 'bottom', 'vintage', 'retro', 'new', 'used', 'condition',
        ];
        
        foreach ($invalidWords as $word) {
            if (stripos($name, $word) !== false) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Precarga todos los diseñadores existentes en un caché
     */
    protected function preloadDesignerCache()
    {
        $this->logInfo("Precargando diseñadores existentes...");
        $designers = Designer::pluck('name')->toArray();
        
        foreach ($designers as $name) {
            $this->designerCache[strtolower($name)] = true;
        }
        
        $this->logInfo("Precargados " . count($designers) . " diseñadores");
    }
    
    /**
     * Genera una imagen por defecto para un diseñador
     */
    protected function generateDefaultImage(string $name)
    {
        $initial = strtoupper(substr($name, 0, 1));
        $color = substr(md5($name), 0, 6);
        
        return "https://via.placeholder.com/150/{$color}/ffffff?text={$initial}";
    }
    
    /**
     * Genera una descripción para un diseñador
     */
    protected function generateDescription(string $name, array $hit)
    {
        return "Fashion designer and brand: {$name}";
    }
    
    /**
     * Extrae categorías posibles de un producto
     */
    protected function extractCategories(array $hit)
    {
        $categories = [];
        
        // Intentar extraer categorías de las etiquetas del producto
        $tags = $hit['tags'] ?? $hit['keywords'] ?? [];
        
        // Categorías comunes que podríamos encontrar
        $possibleCategories = [
            'menswear', 'womenswear', 'streetwear', 'luxury', 'sportswear', 
            'vintage', 'accessories', 'footwear', 'outerwear', 'denim', 'formal'
        ];
        
        foreach ($possibleCategories as $category) {
            if (in_array($category, $tags) || 
                (isset($hit['category']) && stripos($hit['category'], $category) !== false) ||
                (isset($hit['description']) && stripos($hit['description'], $category) !== false)) {
                $categories[] = $category;
            }
        }
        
        // Si no hay categorías, inferir basado en el departamento
        if (empty($categories)) {
            $department = $hit['department'] ?? '';
            if (stripos($department, 'men') !== false) {
                $categories[] = 'menswear';
            } elseif (stripos($department, 'women') !== false) {
                $categories[] = 'womenswear';
            }
        }
        
        return $categories;
    }
    
    protected function logInfo(string $message)
    {
        Log::info($message);
    }
    
    protected function logError(string $message)
    {
        Log::error($message);
    }
}
