<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GrailedApiService
{
    protected $baseUrl = 'https://www.grailed.com/api/listings';
    protected $headers = [
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept' => 'application/json',
        'Accept-Language' => 'en-US,en;q=0.9',
        'Referer' => 'https://www.grailed.com/',
        'X-Requested-With' => 'XMLHttpRequest'
    ];

    public function search($query = '', $page = 1, $limit = 50, $sort = 'relevance')
    {
        try {
            Log::info("Making Grailed API request", [
                'query' => $query,
                'page' => $page,
                'limit' => $limit
            ]);

            $params = [
                'page' => $page,
                'hits_per_page' => $limit,
                'sort' => $sort
            ];

            if (!empty($query)) {
                $params['query'] = $query;
            }

            $response = Http::withHeaders($this->headers)
                ->timeout(30)
                ->get($this->baseUrl, $params);

            Log::info("Grailed API response status: " . $response->status());
            
            if ($response->successful()) {
                $data = $response->json();
                
                Log::info("Grailed API response structure", [
                    'has_data' => !empty($data),
                    'data_keys' => is_array($data) ? array_keys($data) : 'not_array',
                    'hits_count' => isset($data['hits']) ? count($data['hits']) : 0
                ]);
                
                return $data;
            } else {
                Log::error("Grailed API error", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                
                return $this->getFallbackData($query);
            }

        } catch (\Exception $e) {
            Log::error('Grailed API exception: ' . $e->getMessage());
            return $this->getFallbackData($query);
        }
    }

    protected function getFallbackData($query = '')
    {
        // Datos de fallback para cuando la API no funcione
        $fallbackDesigners = [
            ['name' => 'Nike', 'id' => 1],
            ['name' => 'Adidas', 'id' => 2],
            ['name' => 'Supreme', 'id' => 3],
            ['name' => 'Off-White', 'id' => 4],
            ['name' => 'Gucci', 'id' => 5],
            ['name' => 'Louis Vuitton', 'id' => 6],
            ['name' => 'Balenciaga', 'id' => 7],
            ['name' => 'Jordan', 'id' => 8],
            ['name' => 'Yeezy', 'id' => 9],
            ['name' => 'Stone Island', 'id' => 10],
            ['name' => 'CP Company', 'id' => 11],
            ['name' => 'Acne Studios', 'id' => 12],
            ['name' => 'Rick Owens', 'id' => 13],
            ['name' => 'Raf Simons', 'id' => 14],
            ['name' => 'Undercover', 'id' => 15],
            ['name' => 'Comme des Garçons', 'id' => 16],
            ['name' => 'Bape', 'id' => 17],
            ['name' => 'Kenzo', 'id' => 18],
            ['name' => 'Palm Angels', 'id' => 19],
            ['name' => 'Fear of God', 'id' => 20]
        ];

        $hits = [];
        
        if (empty($query)) {
            // Sin query, devolver todos
            foreach ($fallbackDesigners as $designer) {
                $hits[] = [
                    'id' => $designer['id'],
                    'name' => $designer['name'],
                    'designer' => ['name' => $designer['name']],
                    'brand' => $designer['name'],
                    'category' => 'fashion',
                    'image_url' => "https://via.placeholder.com/300x300?text=" . urlencode($designer['name'])
                ];
            }
        } else {
            // Con query, filtrar
            foreach ($fallbackDesigners as $designer) {
                if (stripos($designer['name'], $query) !== false) {
                    $hits[] = [
                        'id' => $designer['id'],
                        'name' => $designer['name'],
                        'designer' => ['name' => $designer['name']],
                        'brand' => $designer['name'],
                        'category' => 'fashion',
                        'image_url' => "https://via.placeholder.com/300x300?text=" . urlencode($designer['name'])
                    ];
                }
            }
        }

        return [
            'hits' => $hits,
            'total_hits' => count($hits),
            'fallback' => true
        ];
    }

    public function getDesigners($limit = 100)
    {
        return $this->search('', 1, $limit);
    }
}
