<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('designers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->string('image_url')->nullable();
            $table->text('description')->nullable();
            $table->string('website')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->integer('items_count')->default(0);
            $table->json('categories')->nullable(); // ['menswear', 'womenswear', 'accessories']
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('designers');
    }
};
