<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GrailedApiService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl = 'https://grailed.p.rapidapi.com';
    
    public function __construct()
    {
        $this->apiKey = '06dabf243bmsh6717422b8d94e56p1d6004jsn3110106e45e2';
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout' => 30,
            'headers' => [
                'X-RapidAPI-Host' => 'grailed.p.rapidapi.com',
                'X-RapidAPI-Key' => $this->apiKey,
                'User-Agent' => 'VogueX-App/1.0'
            ]
        ]);
    }
    
    public function search($query, $page = 1, $hitsPerPage = 32, $sortBy = 'mostrecent')
    {
        $cacheKey = "grailed_search_" . md5($query . $page . $hitsPerPage . $sortBy);
        
        return Cache::remember($cacheKey, now()->addHours(1), function () use ($query, $page, $hitsPerPage, $sortBy) {
            try {
                $response = $this->client->get('/search', [
                    'query' => [
                        'query' => $query,
                        'page' => $page,
                        'hitsPerPage' => $hitsPerPage,
                        'sortBy' => $sortBy
                    ]
                ]);
                
                $data = json_decode($response->getBody()->getContents(), true);
                return $data;
                
            } catch (\Exception $e) {
                Log::error('Grailed API search error: ' . $e->getMessage());
                return null;
            }
        });
    }
    
    public function getDesigners()
    {
        $cacheKey = 'grailed_designers_list';
        
        return Cache::remember($cacheKey, now()->addDay(), function () {
            try {
                // Grailed no tiene endpoint específico para diseñadores
                // Tenemos que extraerlos de las búsquedas
                return $this->extractDesignersFromSearch();
                
            } catch (\Exception $e) {
                Log::error('Grailed API designers error: ' . $e->getMessage());
                return [];
            }
        });
    }
    
    protected function extractDesignersFromSearch()
    {
        $designers = [];
        
        // Buscar por términos populares para obtener más diseñadores
        $searchTerms = ['luxury', 'streetwear', 'vintage', 'designer', 'fashion'];
        
        foreach ($searchTerms as $term) {
            $results = $this->search($term, 1, 50);
            
            if ($results && isset($results['hits'])) {
                foreach ($results['hits'] as $product) {
                    if (isset($product['designer']['name'])) {
                        $designerName = $product['designer']['name'];
                        
                        if (!isset($designers[$designerName])) {
                            $designers[$designerName] = [
                                'name' => $designerName,
                                'id' => $product['designer']['id'] ?? null,
                                'image_url' => $product['designer']['image_url'] ?? null,
                                'items_count' => 1
                            ];
                        } else {
                            $designers[$designerName]['items_count']++;
                        }
                    }
                }
            }
            
            // Rate limiting
            sleep(1);
        }
        
        return array_values($designers);
    }
}
