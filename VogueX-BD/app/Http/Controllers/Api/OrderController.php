<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Offer;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    protected $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Get user's orders
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $status = $request->query('status');

            $query = Order::with(['product', 'offer', 'buyer', 'seller'])
                ->where(function ($q) use ($user) {
                    $q->where('buyer_id', $user->id)
                      ->orWhere('seller_id', $user->id);
                });

            if ($status) {
                $query->where('status', $status);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific order details
     */
    public function show(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $order = Order::with(['product', 'offer', 'buyer', 'seller'])
                ->where('id', $id)
                ->where(function ($q) use ($user) {
                    $q->where('buyer_id', $user->id)
                      ->orWhere('seller_id', $user->id);
                })
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error loading order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process payment and create order
     */
    public function processPayment(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'offer_id' => 'required|exists:offers,id',
                'payment_method.type' => 'required|in:visa,debit,apple_pay,paypal',
                'shipping_address.full_name' => 'required|string|max:255',
                'shipping_address.phone' => 'required|string|max:20',
                'shipping_address.street_address' => 'required|string|max:255',
                'shipping_address.apartment' => 'nullable|string|max:255',
                'shipping_address.city' => 'required|string|max:100',
                'shipping_address.state' => 'required|string|max:100',
                'shipping_address.postal_code' => 'required|string|max:20',
                'shipping_address.country' => 'required|string|max:100',
                'shipping_address.instructions' => 'nullable|string|max:500',
            ]);

            $user = $request->user();
            $offer = Offer::with(['product', 'buyer', 'seller'])->findOrFail($validated['offer_id']);

            // Verify user is the buyer and offer is accepted
            if ($offer->buyer_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to pay for this offer'
                ], 403);
            }

            if ($offer->status !== 'accepted') {
                return response()->json([
                    'success' => false,
                    'message' => 'Offer must be accepted to process payment'
                ], 400);
            }

            // Process payment (mock implementation)
            $paymentResult = [
                'success' => true,
                'transaction_id' => 'txn_' . uniqid(),
                'payment_intent_id' => 'pi_' . uniqid()
            ];

            // Create order
            $order = Order::create([
                'offer_id' => $offer->id,
                'buyer_id' => $offer->buyer_id,
                'seller_id' => $offer->seller_id,
                'product_id' => $offer->product_id,
                'amount' => $offer->amount,
                'status' => 'processing',
                'payment_method' => $validated['payment_method']['type'],
                'payment_status' => 'completed',
                'transaction_id' => $paymentResult['transaction_id'],
                'shipping_address' => json_encode($validated['shipping_address']),
                'estimated_delivery' => now()->addDays(7), // 7 days from now
            ]);

            // Update offer status
            $offer->update(['status' => 'paid']);

            $order->load(['product', 'offer', 'buyer', 'seller']);

            return response()->json([
                'success' => true,
                'message' => 'Payment processed successfully',
                'data' => [
                    'order' => $order,
                    'payment_intent_id' => $paymentResult['payment_intent_id'] ?? null
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error processing payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel an order
     */
    public function cancel(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'reason' => 'nullable|string|max:500'
            ]);

            $user = $request->user();
            
            $order = Order::where('id', $id)
                ->where('buyer_id', $user->id)
                ->whereIn('status', ['pending', 'processing'])
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found or cannot be cancelled'
                ], 404);
            }

            $order->update([
                'status' => 'cancelled',
                'notes' => $validated['reason'] ?? 'Cancelled by user'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error cancelling order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order status (for admin/seller)
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
                'tracking_number' => 'nullable|string|max:100',
                'notes' => 'nullable|string|max:500'
            ]);

            $user = $request->user();
            
            $order = Order::where('id', $id)
                ->where('seller_id', $user->id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found or unauthorized'
                ], 404);
            }

            $updateData = ['status' => $validated['status']];

            if (isset($validated['tracking_number'])) {
                $updateData['tracking_number'] = $validated['tracking_number'];
            }

            if (isset($validated['notes'])) {
                $updateData['notes'] = $validated['notes'];
            }

            if ($validated['status'] === 'delivered') {
                $updateData['delivered_at'] = now();
            }

            $order->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully'
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating order: ' . $e->getMessage()
            ], 500);
        }
    }
}
