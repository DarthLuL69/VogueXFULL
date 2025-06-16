<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserOrderController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        // Datos de ejemplo para pedidos
        $orders = [
            [
                'id' => 1,
                'offer_id' => 1,
                'buyer_id' => $user->id,
                'seller_id' => 2,
                'product_id' => 1,
                'amount' => 125.99,
                'status' => 'delivered',
                'payment_method' => 'visa',
                'payment_status' => 'completed',
                'transaction_id' => 'TXN_001_' . time(),
                'shipping_address' => [
                    'full_name' => $user->name,
                    'phone' => '+34 123 456 789',
                    'street_address' => 'Calle Principal 123',
                    'apartment' => 'Piso 2A',
                    'city' => 'Madrid',
                    'state' => 'Madrid',
                    'postal_code' => '28001',
                    'country' => 'España',
                    'instructions' => 'Dejar en portería'
                ],
                'tracking_number' => 'TRK001234567',
                'notes' => 'Entregado en perfecto estado',
                'created_at' => now()->subDays(5)->toISOString(),
                'updated_at' => now()->subDays(1)->toISOString(),
                'buyer' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_url' => $user->avatar_url
                ],
                'seller' => [
                    'id' => 2,
                    'name' => 'María González',
                    'email' => 'maria@example.com',
                    'avatar_url' => null
                ],
                'product' => [
                    'id' => 1,
                    'name' => 'Chaqueta Vintage Denim',
                    'price' => 125.99,
                    'image_url' => 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'
                ]
            ],
            [
                'id' => 2,
                'offer_id' => 2,
                'buyer_id' => $user->id,
                'seller_id' => 3,
                'product_id' => 2,
                'amount' => 89.50,
                'status' => 'shipped',
                'payment_method' => 'paypal',
                'payment_status' => 'completed',
                'transaction_id' => 'TXN_002_' . time(),
                'shipping_address' => [
                    'full_name' => $user->name,
                    'phone' => '+34 123 456 789',
                    'street_address' => 'Calle Principal 123',
                    'apartment' => 'Piso 2A',
                    'city' => 'Madrid',
                    'state' => 'Madrid',
                    'postal_code' => '28001',
                    'country' => 'España'
                ],
                'tracking_number' => 'TRK001234568',
                'created_at' => now()->subDays(2)->toISOString(),
                'updated_at' => now()->subHours(6)->toISOString(),
                'buyer' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_url' => $user->avatar_url
                ],
                'seller' => [
                    'id' => 3,
                    'name' => 'Carlos Ruiz',
                    'email' => 'carlos@example.com',
                    'avatar_url' => null
                ],
                'product' => [
                    'id' => 2,
                    'name' => 'Zapatos de Cuero Clásicos',
                    'price' => 89.50,
                    'image_url' => 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'
                ]
            ],
            [
                'id' => 3,
                'offer_id' => 3,
                'buyer_id' => $user->id,
                'seller_id' => 4,
                'product_id' => 3,
                'amount' => 45.00,
                'status' => 'processing',
                'payment_method' => 'debit',
                'payment_status' => 'completed',
                'transaction_id' => 'TXN_003_' . time(),
                'shipping_address' => [
                    'full_name' => $user->name,
                    'phone' => '+34 123 456 789',
                    'street_address' => 'Calle Principal 123',
                    'apartment' => 'Piso 2A',
                    'city' => 'Madrid',
                    'state' => 'Madrid',
                    'postal_code' => '28001',
                    'country' => 'España'
                ],
                'created_at' => now()->subHours(12)->toISOString(),
                'updated_at' => now()->subHours(2)->toISOString(),
                'buyer' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar_url' => $user->avatar_url
                ],
                'seller' => [
                    'id' => 4,
                    'name' => 'Ana Martín',
                    'email' => 'ana@example.com',
                    'avatar_url' => null
                ],
                'product' => [
                    'id' => 3,
                    'name' => 'Camiseta Designer Premium',
                    'price' => 45.00,
                    'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    public function show($id)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        // Simular obtener un pedido específico
        $order = [
            'id' => (int)$id,
            'offer_id' => 1,
            'buyer_id' => $user->id,
            'seller_id' => 2,
            'product_id' => 1,
            'amount' => 125.99,
            'status' => 'delivered',
            'payment_method' => 'visa',
            'payment_status' => 'completed',
            'transaction_id' => 'TXN_001_' . time(),
            'shipping_address' => [
                'full_name' => $user->name,
                'phone' => '+34 123 456 789',
                'street_address' => 'Calle Principal 123',
                'apartment' => 'Piso 2A',
                'city' => 'Madrid',
                'state' => 'Madrid',
                'postal_code' => '28001',
                'country' => 'España',
                'instructions' => 'Dejar en portería'
            ],
            'tracking_number' => 'TRK001234567',
            'notes' => 'Entregado en perfecto estado',
            'created_at' => now()->subDays(5)->toISOString(),
            'updated_at' => now()->subDays(1)->toISOString(),
            'buyer' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url
            ],
            'seller' => [
                'id' => 2,
                'name' => 'María González',
                'email' => 'maria@example.com',
                'avatar_url' => null
            ],
            'product' => [
                'id' => 1,
                'name' => 'Chaqueta Vintage Denim',
                'price' => 125.99,
                'image_url' => 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }
}
