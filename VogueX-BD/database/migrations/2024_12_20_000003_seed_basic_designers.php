<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        $designers = [
            [
                'id' => 1,
                'name' => 'Nike',
                'slug' => 'nike',
                'image_url' => 'https://via.placeholder.com/150x150?text=Nike',
                'description' => 'American multinational corporation that designs athletic footwear and apparel.',
                'website' => 'https://www.nike.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 1250,
                'categories' => json_encode(['footwear', 'sportswear']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'name' => 'Adidas',
                'slug' => 'adidas',
                'image_url' => 'https://via.placeholder.com/150x150?text=Adidas',
                'description' => 'German multinational corporation that designs athletic shoes and clothing.',
                'website' => 'https://www.adidas.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 980,
                'categories' => json_encode(['footwear', 'sportswear']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'name' => 'Supreme',
                'slug' => 'supreme',
                'image_url' => 'https://via.placeholder.com/150x150?text=Supreme',
                'description' => 'American clothing and skateboarding lifestyle brand.',
                'website' => 'https://www.supremenewyork.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 750,
                'categories' => json_encode(['streetwear', 'accessories']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 4,
                'name' => 'Off-White',
                'slug' => 'off-white',
                'image_url' => 'https://via.placeholder.com/150x150?text=Off-White',
                'description' => 'Italian luxury fashion label founded by Virgil Abloh.',
                'website' => 'https://www.off---white.com',
                'is_popular' => true,
                'is_featured' => false,
                'items_count' => 650,
                'categories' => json_encode(['luxury', 'streetwear']),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 5,
                'name' => 'Gucci',
                'slug' => 'gucci',
                'image_url' => 'https://via.placeholder.com/150x150?text=Gucci',
                'description' => 'Italian luxury brand of fashion and leather goods.',
                'website' => 'https://www.gucci.com',
                'is_popular' => true,
                'is_featured' => true,
                'items_count' => 890,
                'categories' => json_encode(['luxury', 'accessories']),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($designers as $designer) {
            DB::table('designers')->updateOrInsert(
                ['name' => $designer['name']],
                $designer
            );
        }
    }

    public function down()
    {
        DB::table('designers')->whereIn('name', ['Nike', 'Adidas', 'Supreme', 'Off-White', 'Gucci'])->delete();
    }
};
