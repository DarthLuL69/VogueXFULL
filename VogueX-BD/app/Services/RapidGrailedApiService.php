<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Client;

class GrailedApiService
{
    protected $client;
    protected $baseUrl = 'https://www.grailed.com/api/listings/feed';
    protected $rapidApiKey = '06dabf243bmsh6717422b8d94e56p1d6004jsn3110106e45e2';
    
    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
                'Accept' => 'application/json',
                'x-rapidapi-key' => $this->rapidApiKey,
                'x-rapidapi-host' => 'grailed.p.rapidapi.com'
            ]
        ]);
    }
    
    /**
     * Realizar búsqueda en la API de Grailed
     */
    public function search($query = '', $page = 1, $hitsPerPage = 32, $sortBy = 'default')
    {
        try {
            Log::info("Realizando búsqueda en Grailed API", [
                'query' => $query,
                'page' => $page,
                'hitsPerPage' => $hitsPerPage
            ]);
            
            // Si estamos usando RapidAPI
            $response = Http::withHeaders([
                'x-rapidapi-key' => $this->rapidApiKey,
                'x-rapidapi-host' => 'grailed.p.rapidapi.com'
            ])->get('https://grailed.p.rapidapi.com/search', [
                'query' => $query,
                'page' => $page,
                'hitsPerPage' => $hitsPerPage,
                'sortBy' => $sortBy
            ]);
            
            // Verificar respuesta
            if (!$response->successful()) {
                Log::error("Error en respuesta de Grailed API: " . $response->status());
                return [];
            }
            
            // Procesar datos
            $data = $response->json();
            Log::info("Respuesta exitosa de Grailed API con {$hitsPerPage} resultados");
            
            return $data;
            
        } catch (\Exception $e) {
            Log::error("Error en GrailedApiService: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener diseñadores populares
     */
    public function getPopularDesigners()
    {
        try {
            $designers = [];
            
            // Buscar diseñadores populares con diferentes términos
            $terms = ['nike', 'adidas', 'supreme', 'gucci', 'balenciaga', 'off-white', 'stone island'];
            
            foreach ($terms as $term) {
                $results = $this->search($term, 1, 10);
                if (isset($results['hits']) && !empty($results['hits'])) {
                    foreach ($results['hits'] as $hit) {
                        $designer = $hit['designer'] ?? $hit['brand'] ?? '';
                        if ($designer && !in_array($designer, $designers)) {
                            $designers[] = $designer;
                        }
                    }
                }
            }
            
            return $designers;
            
        } catch (\Exception $e) {
            Log::error("Error obteniendo diseñadores populares: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Obtener tendencias actuales
     */
    public function getTrends()
    {
        try {
            $results = $this->search('trending', 1, 50, 'popular');
            
            $trends = [];
            $brandCounts = [];
            $categoryCounts = [];
            
            if (isset($results['hits']) && !empty($results['hits'])) {
                foreach ($results['hits'] as $hit) {
                    // Contar marcas
                    $brand = $hit['designer'] ?? $hit['brand'] ?? '';
                    if ($brand) {
                        if (!isset($brandCounts[$brand])) {
                            $brandCounts[$brand] = 0;
                        }
                        $brandCounts[$brand]++;
                    }
                    
                    // Contar categorías
                    $category = $hit['category'] ?? '';
                    if ($category) {
                        if (!isset($categoryCounts[$category])) {
                            $categoryCounts[$category] = 0;
                        }
                        $categoryCounts[$category]++;
                    }
                }
                
                // Ordenar por popularidad
                arsort($brandCounts);
                arsort($categoryCounts);
                
                $trends = [
                    'popular_brands' => array_slice(array_keys($brandCounts), 0, 10),
                    'popular_categories' => array_slice(array_keys($categoryCounts), 0, 10),
                ];
            }
            
            return $trends;
            
        } catch (\Exception $e) {
            Log::error("Error obteniendo tendencias: " . $e->getMessage());
            return [];
        }
    }
}
