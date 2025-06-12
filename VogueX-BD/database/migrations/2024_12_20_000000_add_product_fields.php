<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('brand')->nullable()->after('name');
            $table->string('condition')->nullable()->after('description');
            $table->string('size')->nullable()->after('condition');
            $table->string('main_category')->nullable()->after('size');
            $table->string('sub_category')->nullable()->after('main_category');
            $table->string('final_category')->nullable()->after('sub_category');
            $table->decimal('original_price', 10, 2)->nullable()->after('price');
            $table->string('status')->default('active')->after('is_active');
            $table->unsignedBigInteger('user_id')->nullable()->after('status');
            
            // Índices para mejorar el rendimiento
            $table->index('brand');
            $table->index('status');
            $table->index(['main_category', 'sub_category', 'final_category']);
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['products_brand_index']);
            $table->dropIndex(['products_status_index']);
            $table->dropIndex(['products_main_category_sub_category_final_category_index']);
            
            $table->dropColumn([
                'brand',
                'condition', 
                'size',
                'main_category',
                'sub_category',
                'final_category',
                'original_price',
                'status',
                'user_id'
            ]);
        });
    }
};
