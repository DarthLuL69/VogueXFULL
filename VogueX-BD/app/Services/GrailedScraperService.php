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
        $this->info('Starting Grailed designers scrape...');
        
        $allDesigners = [];
        $designerCounts = [];
        
        // Buscar por letras del alfabeto y marcas populares
        $searchTerms = array_merge(
            range('a', 'z'),
            ['nike', 'adidas', 'supreme', 'off-white', 'gucci', 'louis vuitton', 'balenciaga', 'yeezy', 'jordan', 'dior']
        );
        
        foreach ($searchTerms as $term) {
            $designers = $this->scrapeDesignersByTerm($term);
            
            foreach ($designers as $designer) {
                $designerName = $designer['name'];
                
                if (!isset($designerCounts[$designerName])) {
                    $designerCounts[$designerName] = 0;
                    $allDesigners[$designerName] = $designer;
                }
                
                $designerCounts[$designerName] += $designer['items_count'] ?? 1;
            }
            
            // Delay to avoid rate limiting
            sleep(1);
        }
        
        // Actualizar contadores y guardar en BD
        $created = 0;
        $updated = 0;
        
        foreach ($allDesigners as $designerName => $designerData) {
            $designerData['items_count'] = $designerCounts[$designerName];
            $result = $this->saveDesigner($designerData);
            
            if ($result['created']) {
                $created++;
            } else {
                $updated++;
            }
        }
        
        Log::info("Grailed scrape completed: {$created} created, {$updated} updated");
        
        return [
            'created' => $created,
            'updated' => $updated,
            'total' => count($allDesigners)
        ];
    }
    
    protected function scrapeDesignersByTerm($term)
    {
        try {
            $response = $this->grailedApi->search($term, 1, 50);
            
            if (!$response || !isset($response['hits'])) {
                return [];
            }
            
            $designers = [];
            $processedBrands = [];
            
            foreach ($response['hits'] as $product) {
                $brand = $product['designer']['name'] ?? null;
                
                if (!$brand || isset($processedBrands[$brand])) {
                    continue;
                }
                
                $processedBrands[$brand] = true;
                
                $designers[] = [
                    'name' => $brand,
                    'slug' => Str::slug($brand),
                    'image_url' => $this->getDesignerImage($product['designer']),
                    'description' => $this->generateDescription($brand),
                    'website' => $this->guessWebsite($brand),
                    'is_popular' => $this->isPopularBrand($brand),
                    'is_featured' => false,
                    'categories' => $this->extractCategories($product),
                    'items_count' => 1
                ];
            }
            
            return $designers;
            
        } catch (\Exception $e) {
            Log::error("Error scraping designers for term '{$term}': " . $e->getMessage());
            return [];
        }
    }
    
    protected function getDesignerImage($designer)
    {
        // Si Grailed proporciona imagen
        if (isset($designer['image_url'])) {
            return $designer['image_url'];
        }
        
        // Buscar logo en APIs públicas o usar placeholder
        $name = $designer['name'] ?? 'Designer';
        return "https://via.placeholder.com/150x150?text=" . urlencode($name);
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
            $designer = Designer::updateOrCreate(
                ['name' => $data['name']],
                $data
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
