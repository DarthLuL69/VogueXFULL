<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->text('last_message')->nullable();
            $table->timestamp('last_message_time')->nullable();
            $table->integer('unread_buyer')->default(0);
            $table->integer('unread_seller')->default(0);
            $table->string('status')->default('active'); // active, archived, blocked
            $table->timestamps();

            // Un comprador solo puede tener un chat por producto con el mismo vendedor
            $table->unique(['buyer_id', 'seller_id', 'product_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chats');
    }
};
