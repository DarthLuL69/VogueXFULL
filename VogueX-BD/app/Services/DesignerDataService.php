<?php

namespace App\Services;

use App\Models\Designer;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class DesignerDataService
{
    protected $client;
    protected $logoFetcher;

    public function __construct(LogoFetcherService $logoFetcher)
    {
        $this->logoFetcher = $logoFetcher;
        $this->client = new Client([
            'timeout' => 30,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            ]
        ]);
    }

    public function syncDesignersFromExternalSources()
    {
        $designers = $this->getFashionDesigners();
        $created = 0;
        $updated = 0;
        
        foreach ($designers as $designerData) {
            $result = $this->createOrUpdateDesigner($designerData);
            if ($result['created']) {
                $created++;
            } else {
                $updated++;
            }
        }

        Log::info("Designer sync completed: {$created} created, {$updated} updated");
        
        return [
            'created' => $created,
            'updated' => $updated,
            'total' => count($designers)
        ];
    }

    protected function getFashionDesigners()
    {
        return [
            [
                'name' => 'Nike',
                'image_url' => $this->logoFetcher->getDesignerLogo('Nike'),
                'description' => 'American multinational corporation that designs, develops, and manufactures athletic footwear, apparel, and accessories.',
                'website' => 'https://www.nike.com',
                'is_popular' => true,
                'is_featured' => true,
                'categories' => ['menswear', 'womenswear', 'footwear'],
                'items_count' => 1250
            ],
            [
                'name' => 'Adidas',
                'image_url' => $this->logoFetcher->getDesignerLogo('Adidas'),
                'description' => 'German multinational corporation that designs and manufactures shoes, clothing and accessories.',
                'website' => 'https://www.adidas.com',
                'is_popular' => true,
                'is_featured' => true,
                'categories' => ['menswear', 'womenswear', 'footwear'],
                'items_count' => 890
            ],
            [
                'name' => 'Off-White',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2021/06/Off-White-logo.png',
                'description' => 'Italian luxury fashion label founded by American designer Virgil Abloh.',
                'website' => 'https://www.off---white.com',
                'is_popular' => true,
                'is_featured' => true,
                'categories' => ['menswear', 'womenswear', 'accessories'],
                'items_count' => 567
            ],
            [
                'name' => 'Supreme',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2017/05/Supreme-Logo.png',
                'description' => 'American clothing and skateboarding lifestyle brand established in New York City.',
                'website' => 'https://www.supremenewyork.com',
                'is_popular' => true,
                'is_featured' => true,
                'categories' => ['menswear', 'streetwear', 'accessories'],
                'items_count' => 423
            ],
            [
                'name' => 'Gucci',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2017/02/Gucci-Logo.png',
                'description' => 'Italian luxury brand of fashion and leather goods.',
                'website' => 'https://www.gucci.com',
                'is_popular' => true,
                'is_featured' => true,
                'categories' => ['menswear', 'womenswear', 'accessories', 'bags'],
                'items_count' => 789
            ],
            [
                'name' => 'Louis Vuitton',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2017/03/Louis-Vuitton-Logo.png',
                'description' => 'French fashion house and luxury retail company founded in 1854.',
                'website' => 'https://www.louisvuitton.com',
                'is_popular' => true,
                'is_featured' => false,
                'categories' => ['menswear', 'womenswear', 'bags', 'accessories'],
                'items_count' => 234
            ],
            [
                'name' => 'Balenciaga',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2017/05/Balenciaga-Logo.png',
                'description' => 'Spanish luxury fashion house founded by Cristóbal Balenciaga.',
                'website' => 'https://www.balenciaga.com',
                'is_popular' => true,
                'is_featured' => false,
                'categories' => ['menswear', 'womenswear', 'footwear'],
                'items_count' => 345
            ],
            [
                'name' => 'Yeezy',
                'image_url' => 'https://logos-world.net/wp-content/uploads/2020/06/Yeezy-Logo.png',
                'description' => 'American fashion brand founded by Kanye West.',
                'website' => 'https://www.yeezy.com',
                'is_popular' => true,
                'is_featured' => false,
                'categories' => ['menswear', 'womenswear', 'footwear'],
                'items_count' => 678
            ],
            [
                'name' => 'Jordan',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2016/10/Air-Jordan-Logo.png',
                'description' => 'Basketball footwear and athletic clothing brand owned by Nike.',
                'website' => 'https://www.jordan.com',
                'is_popular' => true,
                'is_featured' => false,
                'categories' => ['menswear', 'womenswear', 'footwear'],
                'items_count' => 912
            ],
            [
                'name' => 'Dior',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2017/02/Dior-Logo.png',
                'description' => 'French luxury goods company controlled by LVMH.',
                'website' => 'https://www.dior.com',
                'is_popular' => true,
                'is_featured' => false,
                'categories' => ['menswear', 'womenswear', 'accessories', 'bags'],
                'items_count' => 156
            ],
            [
                'name' => 'Prada',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2017/02/Prada-Logo.png',
                'description' => 'Italian luxury fashion house founded in 1913.',
                'website' => 'https://www.prada.com',
                'is_popular' => false,
                'is_featured' => false,
                'categories' => ['menswear', 'womenswear', 'bags'],
                'items_count' => 287
            ],
            [
                'name' => 'Versace',
                'image_url' => 'https://1000logos.net/wp-content/uploads/2017/05/Versace-Logo.png',
                'description' => 'Italian luxury fashion company founded by Gianni Versace.',
                'website' => 'https://www.versace.com',
                'is_popular' => false,
                'is_featured' => false,
                'categories' => ['menswear', 'womenswear', 'accessories'],
                'items_count' => 198
            ],
            [
                'name' => 'Stone Island',
                'image_url' => 'https://via.placeholder.com/150x150?text=Stone+Island',
                'description' => 'Italian brand known for its innovative fabric treatments.',
                'website' => 'https://www.stoneisland.com',
                'is_popular' => false,
                'is_featured' => false,
                'categories' => ['menswear', 'outerwear'],
                'items_count' => 234
            ],
            [
                'name' => 'Alexander McQueen',
                'image_url' => 'https://via.placeholder.com/150x150?text=Alexander+McQueen',
                'description' => 'British luxury fashion house founded by designer Alexander McQueen.',
                'website' => 'https://www.alexandermcqueen.com',
                'is_popular' => false,
                'is_featured' => false,
                'categories' => ['menswear', 'womenswear'],
                'items_count' => 176
            ]
        ];
    }

    protected function createOrUpdateDesigner($data)
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
            Log::error('Error creating/updating designer: ' . $e->getMessage(), $data);
            throw $e;
        }
    }
}