<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('offer_id')->constrained()->onDelete('cascade');
                $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
                $table->decimal('amount', 10, 2);
                $table->string('payment_method');
                $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
                $table->string('currency', 3)->default('EUR');
                $table->string('transaction_id')->nullable();
                $table->timestamp('processed_at')->nullable();
                $table->timestamps();
                
                $table->index(['buyer_id', 'status']);
                $table->index(['seller_id', 'status']);
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};
