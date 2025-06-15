<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('search_history')) {
            Schema::create('search_history', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
                $table->string('query');
                $table->string('type')->default('product'); // product, designer, category, etc.
                $table->integer('results_count')->default(0);
                $table->timestamps();
                
                // Índice para búsquedas rápidas
                $table->index(['user_id', 'created_at']);
                $table->index('query');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // No hacemos nada para prevenir pérdida de datos
    }
};
