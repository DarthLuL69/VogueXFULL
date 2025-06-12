<?php

namespace App\Services;

use App\Models\Designer;
use App\Services\GrailedApiService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GrailedScraperService
{
    protected $grailedApi;
    
    public function __construct(GrailedApiService $grailedApi)
    {
        $this->grailedApi = $grailedApi;
    }

    public function scrapeAllDesigners()
    {
        $this->info('Starting comprehensive Grailed designers scrape...');
        
        $allDesigners = [];
        $designerCounts = [];
        
        // Empezar con términos más simples para debugging
        $searchTerms = [
            'nike', 'adidas', 'supreme', 'gucci', 'off-white'
        ];
        
        foreach ($searchTerms as $term) {
            $this->info("Scraping term: {$term}");
            
            $designers = $this->scrapeDesignersByTerm($term, 1);
            $this->info("Found " . count($designers) . " designers for term: {$term}");
            
            foreach ($designers as $designer) {
                $designerName = $designer['name'];
                
                if (!isset($designerCounts[$designerName])) {
                    $designerCounts[$designerName] = 0;
                    $allDesigners[$designerName] = $designer;
                }
                
                $designerCounts[$designerName] += $designer['items_count'] ?? 1;
            }
            
            // Delay para evitar rate limiting
            sleep(2);
        }
        
        $this->info("Total unique designers found: " . count($allDesigners));
        
        // Actualizar contadores y guardar en BD
        $created = 0;
        $updated = 0;
        
        foreach ($allDesigners as $designerName => $designerData) {
            $designerData['items_count'] = $designerCounts[$designerName];
            
            try {
                $result = $this->saveDesigner($designerData);
                
                if ($result['created']) {
                    $created++;
                    $this->info("Created: {$designerName}");
                } else {
                    $updated++;
                    $this->info("Updated: {$designerName}");
                }
            } catch (\Exception $e) {
                $this->info("Error saving {$designerName}: " . $e->getMessage());
            }
        }
        
        $this->info("Grailed scrape completed: {$created} created, {$updated} updated");
        
        return [
            'created' => $created,
            'updated' => $updated,
            'total' => count($allDesigners)
        ];
    }
    
    protected function scrapeDesignersByTerm($term, $page = 1)
    {
        try {
            $this->info("Making API call for term: {$term}, page: {$page}");
            $response = $this->grailedApi->search($term, $page, 50);
            
            // Debug: Log the raw response
            Log::info("Raw API response for term '{$term}':", [
                'has_response' => !empty($response),
                'has_hits' => isset($response['hits']),
                'hits_count' => isset($response['hits']) ? count($response['hits']) : 0,
                'response_keys' => is_array($response) ? array_keys($response) : 'not_array'
            ]);
            
            if (!$response || !isset($response['hits']) || empty($response['hits'])) {
                $this->info("No hits found for term: {$term}");
                return [];
            }
            
            $designers = [];
            $processedBrands = [];
            
            foreach ($response['hits'] as $index => $product) {
                // Debug: Log product structure
                if ($index === 0) {
                    Log::info("Sample product structure:", [
                        'product_keys' => is_array($product) ? array_keys($product) : 'not_array',
                        'has_designer' => isset($product['designer']),
                        'has_brand' => isset($product['brand']),
                        'designer_structure' => isset($product['designer']) ? (is_array($product['designer']) ? array_keys($product['designer']) : 'not_array') : 'no_designer'
                    ]);
                }
                
                // Obtener información del diseñador/marca
                $designerInfo = $product['designer'] ?? null;
                $brand = null;
                
                if ($designerInfo && is_array($designerInfo)) {
                    $brand = $designerInfo['name'] ?? null;
                }
                
                if (!$brand) {
                    $brand = $product['brand'] ?? $product['title'] ?? null;
                }
                
                if (!$brand || isset($processedBrands[$brand])) {
                    continue;
                }
                
                $processedBrands[$brand] = true;
                $this->info("Processing designer: {$brand}");
                
                $designers[] = [
                    'name' => $brand,
                    'slug' => Str::slug($brand),
                    'image_url' => $this->getDesignerImage($designerInfo, $brand),
                    'description' => $this->generateDescription($brand),
                    'website' => $this->guessWebsite($brand),
                    'is_popular' => $this->isPopularBrand($brand),
                    'is_featured' => $this->isFeaturedBrand($brand),
                    'categories' => json_encode($this->extractCategories($product)),
                    'items_count' => 1
                ];
            }
            
            $this->info("Processed " . count($designers) . " unique designers from term: {$term}");
            return $designers;
            
        } catch (\Exception $e) {
            Log::error("Error scraping designers for term '{$term}' page {$page}: " . $e->getMessage());
            $this->info("Exception occurred: " . $e->getMessage());
            return [];
        }
    }
    
    protected function getDesignerImage($designer, $brandName)
    {
        // Si Grailed proporciona imagen del diseñador
        if ($designer && isset($designer['image_url'])) {
            return $designer['image_url'];
        }
        
        // Intentar obtener de APIs de logos
        $logoUrls = [
            "https://logo.clearbit.com/{$this->guessDomain($brandName)}",
            "https://via.placeholder.com/150x150?text=" . urlencode($brandName)
        ];
        
        return $logoUrls[0]; // Usar Clearbit como primera opción
    }
    
    protected function guessDomain($brand)
    {
        $domains = [
            'nike' => 'nike.com',
            'adidas' => 'adidas.com',
            'supreme' => 'supremenewyork.com',
            'off-white' => 'off---white.com',
            'gucci' => 'gucci.com',
            'louis vuitton' => 'louisvuitton.com',
            'balenciaga' => 'balenciaga.com',
            // Añadir más según necesites
        ];
        
        $key = strtolower(str_replace([' ', '-'], '', $brand));
        return $domains[$key] ?? strtolower(str_replace(' ', '', $brand)) . '.com';
    }
    
    protected function getItemsCount($product, $brand)
    {
        // Intentar obtener el número real de items desde Grailed
        // Por ahora devolvemos un número base
        return 1;
    }
    
    protected function isFeaturedBrand($brand)
    {
        $featuredBrands = [
            'nike', 'adidas', 'supreme', 'off-white', 'gucci', 'jordan'
        ];
        
        return in_array(strtolower($brand), $featuredBrands);
    }
    
    protected function generateDescription($brand)
    {
        $descriptions = [
            'nike' => 'American multinational corporation that designs, develops, and manufactures athletic footwear, apparel, and accessories.',
            'adidas' => 'German multinational corporation that designs and manufactures shoes, clothing and accessories.',
            'supreme' => 'American clothing and skateboarding lifestyle brand established in New York City.',
            'off-white' => 'Italian luxury fashion label founded by American designer Virgil Abloh.',
            'gucci' => 'Italian luxury brand of fashion and leather goods.',
            'louis vuitton' => 'French fashion house and luxury retail company founded in 1854.',
            'balenciaga' => 'Spanish luxury fashion house founded by Cristóbal Balenciaga.',
            'yeezy' => 'American fashion brand founded by Kanye West.',
            'jordan' => 'Basketball footwear and athletic clothing brand owned by Nike.',
            'dior' => 'French luxury goods company controlled by LVMH.'
        ];
        
        $key = strtolower($brand);
        return $descriptions[$key] ?? "Fashion designer and brand: {$brand}";
    }
    
    protected function guessWebsite($brand)
    {
        $websites = [
            'nike' => 'https://www.nike.com',
            'adidas' => 'https://www.adidas.com',
            'supreme' => 'https://www.supremenewyork.com',
            'off-white' => 'https://www.off---white.com',
            'gucci' => 'https://www.gucci.com',
            'louis vuitton' => 'https://www.louisvuitton.com',
            'balenciaga' => 'https://www.balenciaga.com',
            'yeezy' => 'https://www.yeezy.com',
            'jordan' => 'https://www.jordan.com',
            'dior' => 'https://www.dior.com'
        ];
        
        $key = strtolower($brand);
        return $websites[$key] ?? null;
    }
    
    protected function isPopularBrand($brand)
    {
        $popularBrands = [
            'nike', 'adidas', 'supreme', 'off-white', 'gucci', 
            'louis vuitton', 'balenciaga', 'yeezy', 'jordan', 'dior',
            'prada', 'versace', 'fendi', 'givenchy', 'burberry'
        ];
        
        return in_array(strtolower($brand), $popularBrands);
    }
    
    protected function extractCategories($product)
    {
        $categories = [];
        
        if (isset($product['category'])) {
            $category = strtolower($product['category']);
            
            if (strpos($category, 'footwear') !== false || strpos($category, 'shoes') !== false) {
                $categories[] = 'footwear';
            }
            if (strpos($category, 'tops') !== false || strpos($category, 'shirts') !== false) {
                $categories[] = 'tops';
            }
            if (strpos($category, 'bottoms') !== false || strpos($category, 'pants') !== false) {
                $categories[] = 'bottoms';
            }
            if (strpos($category, 'outerwear') !== false || strpos($category, 'jackets') !== false) {
                $categories[] = 'outerwear';
            }
            if (strpos($category, 'accessories') !== false) {
                $categories[] = 'accessories';
            }
        }
        
        return $categories ?: ['fashion'];
    }
    
    protected function saveDesigner($data)
    {
        try {
            // Asegurar que todos los campos requeridos estén presentes
            $designerData = [
                'name' => $data['name'],
                'slug' => $data['slug'],
                'image_url' => $data['image_url'] ?? null,
                'description' => $data['description'] ?? null,
                'website' => $data['website'] ?? null,
                'is_popular' => $data['is_popular'] ?? false,
                'is_featured' => $data['is_featured'] ?? false,
                'categories' => $data['categories'] ?? '[]',
                'items_count' => $data['items_count'] ?? 1
            ];
            
            $designer = Designer::updateOrCreate(
                ['name' => $designerData['name']],
                $designerData
            );
            
            return [
                'created' => $designer->wasRecentlyCreated,
                'designer' => $designer
            ];
        } catch (\Exception $e) {
            Log::error('Error saving designer: ' . $e->getMessage(), $data);
            throw $e;
        }
    }
    
    protected function info($message)
    {
        Log::info($message);
        if (app()->runningInConsole()) {
            echo $message . "\n";
        }
    }
}
