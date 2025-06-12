<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\NewsScraperService;

class NewsController extends Controller
{
    protected $newsScraperService;
    
    public function __construct(NewsScraperService $newsScraperService)
    {
        $this->newsScraperService = $newsScraperService;
    }
    
    public function latest()
    {
        try {
            $news = $this->newsScraperService->getLatestNews();
            
            return response()->json([
                'success' => true,
                'data' => $news,
                'count' => count($news)
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching news',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
