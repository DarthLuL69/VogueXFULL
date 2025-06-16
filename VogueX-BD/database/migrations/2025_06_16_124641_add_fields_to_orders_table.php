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
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'product_id')) {
                $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('orders', 'payment_id')) {
                $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('orders', 'tracking_number')) {
                $table->string('tracking_number')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['product_id']);
            $table->dropForeign(['payment_id']);
            $table->dropColumn(['product_id', 'payment_id', 'tracking_number']);
        });
    }
};
