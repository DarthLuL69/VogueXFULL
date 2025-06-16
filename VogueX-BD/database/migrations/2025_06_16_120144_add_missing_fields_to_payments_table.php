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
        Schema::table('payments', function (Blueprint $table) {
            // Add user_id as an alias for buyer_id
            $table->foreignId('user_id')->nullable()->after('offer_id')->constrained('users')->onDelete('cascade');
            
            // Add missing fields used by the controller
            $table->string('transaction_id')->nullable()->after('provider_intent_id');
            $table->timestamp('paid_at')->nullable()->after('completed_at');
            $table->json('shipping_address')->nullable()->after('metadata');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'transaction_id', 'paid_at', 'shipping_address']);
        });
    }
};
