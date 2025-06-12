<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Designer;
use Illuminate\Support\Str;

class SeedDesigners extends Command
{
    protected $signature = 'designers:seed {--force : Force overwrite existing designers}';
    protected $description = 'Seed database with popular fashion designers';

    public function handle()
    {
        $this->info('Seeding designers database...');
        
        $designers = $this->getPopularDesigners();
        
        $created = 0;
        $updated = 0;
        
        foreach ($designers as $designerData) {
            try {
                if ($this->option('force')) {
                    $designer = Designer::updateOrCreate(
                        ['name' => $designerData['name']],
                        $designerData
                    );
                    
                    if ($designer->wasRecentlyCreated) {
                        $created++;
                        $this->info("Created: {$designerData['name']}");
                    } else {
                        $updated++;
                        $this->info("Updated: {$designerData['name']}");
                    }
                } else {
                    $existing = Designer::where('name', $designerData['name'])->first();
                    if (!$existing) {
                        Designer::create($designerData);
                        $created++;
                        $this->info("Created: {$designerData['name']}");
                    } else {
                        $this->info("Skipped (exists): {$designerData['name']}");
                    }
                }
            } catch (\Exception $e) {
                $this->error("Error creating {$designerData['name']}: " . $e->getMessage());
            }
        }
        
        $this->info("Seeding completed: {$created} created, {$updated} updated");
        
        return 0;
    }
    
    protected function getPopularDesigners()
    {
        return [
            [
                'name' => 'Nike',
                'slug' => 'nike',
                'image_url' => 'https://logo.clearbit.com/nike.com',
                'description' => 'American multinational corporation that designs, develops, and manufactures athletic footwear, apparel, and accessories.',
                'website' => 'https://www.nike.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 1250,
                'categories' => json_encode(['footwear', 'sportswear', 'accessories'])
            ],
            [
                'name' => 'Adidas',
                'slug' => 'adidas',
                'image_url' => 'https://logo.clearbit.com/adidas.com',
                'description' => 'German multinational corporation that designs and manufactures shoes, clothing and accessories.',
                'website' => 'https://www.adidas.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 980,
                'categories' => json_encode(['footwear', 'sportswear'])
            ],
            [
                'name' => 'Supreme',
                'slug' => 'supreme',
                'image_url' => 'https://logo.clearbit.com/supremenewyork.com',
                'description' => 'American clothing and skateboarding lifestyle brand established in New York City.',
                'website' => 'https://www.supremenewyork.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 750,
                'categories' => json_encode(['streetwear', 'accessories'])
            ],
            [
                'name' => 'Off-White',
                'slug' => 'off-white',
                'image_url' => 'https://logo.clearbit.com/off---white.com',
                'description' => 'Italian luxury fashion label founded by American designer Virgil Abloh.',
                'website' => 'https://www.off---white.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 650,
                'categories' => json_encode(['luxury', 'streetwear'])
            ],
            [
                'name' => 'Gucci',
                'slug' => 'gucci',
                'image_url' => 'https://logo.clearbit.com/gucci.com',
                'description' => 'Italian luxury brand of fashion and leather goods.',
                'website' => 'https://www.gucci.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 890,
                'categories' => json_encode(['luxury', 'accessories'])
            ],
            [
                'name' => 'Louis Vuitton',
                'slug' => 'louis-vuitton',
                'image_url' => 'https://logo.clearbit.com/louisvuitton.com',
                'description' => 'French fashion house and luxury retail company founded in 1854.',
                'website' => 'https://www.louisvuitton.com',
                'is_popular' => true,
                'is_featured' => false,
                'items_count' => 720,
                'categories' => json_encode(['luxury', 'accessories'])
            ],
            [
                'name' => 'Stone Island',
                'slug' => 'stone-island',
                'image_url' => 'https://logo.clearbit.com/stoneisland.com',
                'description' => 'Italian luxury menswear brand known for innovative fabrics and design.',
                'website' => 'https://www.stoneisland.com',
                'is_popular' => true,
                'is_featured' => false,
                'items_count' => 420,
                'categories' => json_encode(['luxury', 'outerwear'])
            ],
            [
                'name' => 'CP Company',
                'slug' => 'cp-company',
                'image_url' => 'https://via.placeholder.com/150x150?text=CP+Company',
                'description' => 'Italian menswear brand known for innovative urban sportswear.',
                'website' => 'https://www.cpcompany.com',
                'is_popular' => true,
                'is_featured' => false,
                'items_count' => 280,
                'categories' => json_encode(['luxury', 'sportswear'])
            ],
            [
                'name' => 'Rick Owens',
                'slug' => 'rick-owens',
                'image_url' => 'https://via.placeholder.com/150x150?text=Rick+Owens',
                'description' => 'American fashion designer known for his avant-garde aesthetic.',
                'is_popular' => true,
                'is_featured' => false,
                'items_count' => 340,
                'categories' => json_encode(['luxury', 'avant-garde'])
            ],
            [
                'name' => 'Acne Studios',
                'slug' => 'acne-studios',
                'image_url' => 'https://logo.clearbit.com/acnestudios.com',
                'description' => 'Swedish fashion house known for its denim and leather goods.',
                'website' => 'https://www.acnestudios.com',
                'is_popular' => true,
                'is_featured' => false,
                'items_count' => 380,
                'categories' => json_encode(['luxury', 'denim'])
            ],
            // Añadir más diseñadores aquí...
        ];
    }
}
