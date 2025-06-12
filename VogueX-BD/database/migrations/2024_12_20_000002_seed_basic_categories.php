<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Insertar categorías básicas
        $categories = [
            [
                'id' => 1,
                'name' => 'Menswear',
                'slug' => 'menswear',
                'description' => 'Ropa masculina',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'name' => 'Womenswear',
                'slug' => 'womenswear',
                'description' => 'Ropa femenina',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'name' => 'Footwear',
                'slug' => 'footwear',
                'description' => 'Calzado y sneakers',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['id' => $category['id']],
                $category
            );
        }
    }

    public function down()
    {
        DB::table('categories')->whereIn('id', [1, 2, 3])->delete();
    }
};
