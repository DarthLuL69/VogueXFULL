<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StockXService;
use Illuminate\Http\Request;

class StockXController extends Controller
{
    protected $stockXService;

    public function __construct(StockXService $stockXService)
    {
        $this->stockXService = $stockXService;
    }

    public function getProductPrice(Request $request)
    {
        $request->validate([
            'product_slug' => 'required|string'
        ]);

        $price = $this->stockXService->getProductPrice($request->product_slug);

        if (!$price) {
            return response()->json([
                'error' => 'No se pudo obtener el precio del producto'
            ], 404);
        }

        return response()->json($price);
    }

    public function getMarketData(Request $request)
    {
        $request->validate([
            'product_slug' => 'required|string'
        ]);

        $marketData = $this->stockXService->getProductMarketData($request->product_slug);

        if (!$marketData) {
            return response()->json([
                'error' => 'No se pudieron obtener los datos del mercado'
            ], 404);
        }

        return response()->json($marketData);
    }

    public function getBrands()
    {
        $brands = $this->stockXService->getBrands();

        return response()->json([
            'brands' => $brands
        ]);
    }

    public function searchProducts(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2'
        ]);

        $products = $this->stockXService->searchProducts($request->query);

        return response()->json([
            'products' => $products
        ]);
    }

    public function getPriceRecommendation(Request $request)
    {
        $request->validate([
            'product_slug' => 'required|string',
            'size' => 'nullable|string'
        ]);

        $recommendation = $this->stockXService->getPriceRecommendation(
            $request->product_slug,
            $request->size
        );

        if (!$recommendation) {
            return response()->json([
                'error' => 'No se pudo obtener la recomendación de precio'
            ], 404);
        }

        return response()->json($recommendation);
    }
} 