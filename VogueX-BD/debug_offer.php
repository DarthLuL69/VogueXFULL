<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test creating an offer to see what exactly is being sent to the database
echo "Testing offer creation debug...\n";

// Enable query logging
DB::enableQueryLog();

try {
    // Simulate what the controller should be doing
    $data = [
        'chat_id' => 1,
        'buyer_id' => 2,
        'seller_id' => 1,
        'amount' => 100.00,
        'status' => 'pending',
        'product_id' => 1,
        'currency' => 'EUR'
    ];
    
    echo "Data being passed to Offer::create():\n";
    print_r($data);
    
    // Check if the offer model has these fields in fillable
    $offer = new \App\Models\Offer();
    echo "\nFillable fields in Offer model:\n";
    print_r($offer->getFillable());
    
    // Try to create the offer
    $result = \App\Models\Offer::create($data);
    
    echo "\nOffer created successfully!\n";
    echo "Created offer ID: " . $result->id . "\n";
    
} catch (Exception $e) {
    echo "\nError creating offer: " . $e->getMessage() . "\n";
    
    // Show the queries that were executed
    $queries = DB::getQueryLog();
    echo "\nQueries executed:\n";
    foreach ($queries as $query) {
        echo "SQL: " . $query['query'] . "\n";
        echo "Bindings: " . json_encode($query['bindings']) . "\n\n";
    }
}
