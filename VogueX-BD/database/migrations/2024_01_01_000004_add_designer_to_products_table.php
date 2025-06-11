<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Solo agregar columnas que no existen
            if (!Schema::hasColumn('products', 'designer_id')) {
                $table->foreignId('designer_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('products', 'brand')) {
                $table->string('brand')->nullable();
            }
            if (!Schema::hasColumn('products', 'size')) {
                $table->string('size')->nullable();
            }
            if (!Schema::hasColumn('products', 'condition')) {
                $table->enum('condition', ['new', 'like_new', 'excellent', 'good', 'fair'])->nullable();
            }
            if (!Schema::hasColumn('products', 'original_price')) {
                $table->decimal('original_price', 10, 2)->nullable();
            }
            // No agregar 'images' porque ya existe
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'designer_id')) {
                $table->dropForeign(['designer_id']);
                $table->dropColumn('designer_id');
            }
            if (Schema::hasColumn('products', 'brand')) {
                $table->dropColumn('brand');
            }
            if (Schema::hasColumn('products', 'size')) {
                $table->dropColumn('size');
            }
            if (Schema::hasColumn('products', 'condition')) {
                $table->dropColumn('condition');
            }
            if (Schema::hasColumn('products', 'original_price')) {
                $table->dropColumn('original_price');
            }
        });
    }
};
