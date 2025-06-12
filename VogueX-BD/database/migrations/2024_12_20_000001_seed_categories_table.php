<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Insertar categoría por defecto si no existe
        DB::table('categories')->insertOrIgnore([
            'id' => 1,
            'name' => 'General',
            'description' => 'Categoría general por defecto',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down()
    {
        DB::table('categories')->where('id', 1)->delete();
    }
};
