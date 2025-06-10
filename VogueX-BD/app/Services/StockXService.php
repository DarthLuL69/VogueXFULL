<?php

namespace App\Services;

use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Facades\Cache;

class StockXService
{
    protected $client;
    protected $baseUrl = 'https://stockx.com';

    public function __construct()
    {
        $this->client = new Client([
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept' => 'application/json, text/plain, */*',
                'Accept-Language' => 'en-US,en;q=0.5',
                'X-Requested-With' => 'XMLHttpRequest',
                'Referer' => 'https://stockx.com/',
            ]
        ]);
    }

    public function getProductMarketData($productSlug)
    {
        $cacheKey = "stockx_market_{$productSlug}";
        
        return Cache::remember($cacheKey, now()->addHours(1), function () use ($productSlug) {
            try {
                // Primero obtenemos el ID del producto
                $response = $this->client->get("{$this->baseUrl}/{$productSlug}");
                $html = (string) $response->getBody();
                
                // Extraemos el ID del producto del HTML
                preg_match('/"productId":"([^"]+)"/', $html, $matches);
                $productId = $matches[1] ?? null;

                if (!$productId) {
                    throw new \Exception('No se pudo encontrar el ID del producto');
                }

                // Obtenemos los datos del mercado usando la API interna de StockX
                $marketResponse = $this->client->get("{$this->baseUrl}/api/v2/products/{$productId}/market-data");
                $marketData = json_decode($marketResponse->getBody(), true);

                return [
                    'last_sale' => $marketData['last_sale'] ?? null,
                    'last_sale_size' => $marketData['last_sale_size'] ?? null,
                    'last_sale_date' => $marketData['last_sale_date'] ?? null,
                    'sales_last_72_hours' => $marketData['sales_last_72_hours'] ?? null,
                    'lowest_ask' => $marketData['lowest_ask'] ?? null,
                    'lowest_ask_size' => $marketData['lowest_ask_size'] ?? null,
                    'highest_bid' => $marketData['highest_bid'] ?? null,
                    'highest_bid_size' => $marketData['highest_bid_size'] ?? null,
                    'total_sold' => $marketData['total_sold'] ?? null,
                    'average_price' => $marketData['average_price'] ?? null,
                    'price_premium' => $marketData['price_premium'] ?? null,
                    'last_updated' => now(),
                ];
            } catch (\Exception $e) {
                return null;
            }
        });
    }

    public function getProductPrice($productSlug)
    {
        $marketData = $this->getProductMarketData($productSlug);
        
        if (!$marketData) {
            return null;
        }

        return [
            'current_price' => $marketData['last_sale'],
            'lowest_ask' => $marketData['lowest_ask'],
            'highest_bid' => $marketData['highest_bid'],
            'average_price' => $marketData['average_price'],
            'last_updated' => $marketData['last_updated'],
        ];
    }

    public function getBrands()
    {
        $cacheKey = 'stockx_brands';
        
        return Cache::remember($cacheKey, now()->addDay(), function () {
            try {
                $response = $this->client->get("{$this->baseUrl}/brands");
                $html = (string) $response->getBody();
                
                $crawler = new Crawler($html);
                
                $brands = $crawler->filter('.brand-item')->each(function (Crawler $node) {
                    return [
                        'name' => $node->filter('.brand-name')->text(),
                        'slug' => $node->attr('href'),
                    ];
                });
                
                return $brands;
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    protected function cleanPrice($price)
    {
        return preg_replace('/[^0-9.]/', '', $price);
    }

    public function searchProducts($query)
    {
        $cacheKey = "stockx_search_{$query}";
        
        return Cache::remember($cacheKey, now()->addHours(1), function () use ($query) {
            try {
                $response = $this->client->get("{$this->baseUrl}/api/v2/search", [
                    'query' => [
                        'query' => $query,
                        'limit' => 10
                    ]
                ]);
                
                $data = json_decode($response->getBody(), true);
                
                return collect($data['products'] ?? [])->map(function ($product) {
                    return [
                        'id' => $product['id'] ?? null,
                        'name' => $product['name'] ?? null,
                        'slug' => $product['url'] ?? null,
                        'brand' => $product['brand'] ?? null,
                        'category' => $product['category'] ?? null,
                        'thumbnail' => $product['thumbnail'] ?? null,
                        'available_sizes' => $product['available_sizes'] ?? [],
                        'retail_price' => $product['retail_price'] ?? null,
                    ];
                })->filter()->values()->all();
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    public function getPriceRecommendation($productSlug, $size = null)
    {
        $marketData = $this->getProductMarketData($productSlug);
        
        if (!$marketData) {
            return null;
        }

        // Calculamos el precio recomendado basado en varios factores
        $lastSale = $marketData['last_sale'] ?? 0;
        $lowestAsk = $marketData['lowest_ask'] ?? 0;
        $highestBid = $marketData['highest_bid'] ?? 0;
        $averagePrice = $marketData['average_price'] ?? 0;
        
        // Calculamos el precio recomendado
        $recommendedPrice = $this->calculateRecommendedPrice($lastSale, $lowestAsk, $highestBid, $averagePrice);

        return [
            'recommended_price' => $recommendedPrice,
            'market_data' => [
                'last_sale' => $lastSale,
                'lowest_ask' => $lowestAsk,
                'highest_bid' => $highestBid,
                'average_price' => $averagePrice,
            ],
            'explanation' => $this->getPriceExplanation($recommendedPrice, $marketData),
            'last_updated' => now(),
        ];
    }

    protected function calculateRecommendedPrice($lastSale, $lowestAsk, $highestBid, $averagePrice)
    {
        // Si no hay datos suficientes, retornamos el precio promedio
        if (!$lastSale && !$lowestAsk && !$highestBid) {
            return $averagePrice;
        }

        // Calculamos un precio que esté entre el highest bid y el lowest ask
        if ($highestBid && $lowestAsk) {
            return round(($highestBid + $lowestAsk) / 2, 2);
        }

        // Si solo tenemos last sale, usamos ese como referencia
        if ($lastSale) {
            return $lastSale;
        }

        // Si solo tenemos lowest ask, sugerimos un precio ligeramente más bajo
        if ($lowestAsk) {
            return round($lowestAsk * 0.95, 2);
        }

        return $averagePrice;
    }

    protected function getPriceExplanation($recommendedPrice, $marketData)
    {
        $lastSale = $marketData['last_sale'] ?? 0;
        $lowestAsk = $marketData['lowest_ask'] ?? 0;
        $highestBid = $marketData['highest_bid'] ?? 0;

        if ($recommendedPrice >= $lowestAsk) {
            return "El precio recomendado está por encima del precio más bajo de venta actual. Considera bajar el precio para aumentar las posibilidades de venta.";
        }

        if ($recommendedPrice <= $highestBid) {
            return "El precio recomendado está por debajo de la oferta más alta actual. Podrías aumentar el precio para maximizar ganancias.";
        }

        return "El precio recomendado está basado en el promedio de las últimas ventas y ofertas actuales del mercado.";
    }
} 