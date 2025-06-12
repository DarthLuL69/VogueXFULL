<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Eliminar tabla si existe para evitar conflictos
        Schema::dropIfExists('products');
        
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->decimal('original_price', 10, 2)->nullable();
            $table->string('condition');
            $table->string('size');
            $table->string('main_category');
            $table->string('sub_category');
            $table->string('final_category');
            $table->json('images'); // Para almacenar array de rutas de imágenes
            $table->string('status')->default('active'); // active, sold, inactive
            $table->unsignedBigInteger('user_id')->nullable(); // Para cuando implementemos usuarios
            $table->timestamps();
            
            $table->index(['main_category', 'sub_category', 'final_category']);
            $table->index('brand');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
};
