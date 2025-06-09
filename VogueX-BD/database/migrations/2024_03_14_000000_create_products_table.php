<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->foreignId('category_id')->constrained();
            $table->decimal('price', 8, 2);
            $table->string('size');
            $table->enum('condition', ['new_with_tags', 'new_without_tags', 'like_new', 'good', 'fair', 'poor']);
            $table->text('description');
            $table->text('damages')->nullable();
            $table->json('images'); // Almacenará las URLs de las imágenes
            $table->boolean('has_front_image')->default(false);
            $table->boolean('has_back_image')->default(false);
            $table->boolean('has_tag_image')->default(false);
            $table->boolean('has_bottom_image')->default(false);
            $table->enum('status', ['active', 'sold', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('products');
    }
}; 