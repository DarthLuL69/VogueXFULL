<?php

namespace App\Services;

use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class NewsScraperService
{
    protected $client;
    
    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            ]
        ]);
    }
    
    public function getLatestNews()
    {
        $cacheKey = 'fashion_news_latest';
        
        return Cache::remember($cacheKey, now()->addHours(2), function () {
            $news = [];
            
            // Scrape GQ Streetwear
            $gqNews = $this->scrapeGQStreetware();
            $news = array_merge($news, $gqNews);
            
            // Scrape Highsnobiety
            $highsnobietyNews = $this->scrapeHighsnobiety();
            $news = array_merge($news, $highsnobietyNews);
            
            // Scrape Hypebeast
            $hypebeastNews = $this->scrapeHypebeast();
            $news = array_merge($news, $hypebeastNews);
            
            // Sort by date and limit to 10 most recent
            usort($news, function($a, $b) {
                return strtotime($b['date']) - strtotime($a['date']);
            });
            
            return array_slice($news, 0, 10);
        });
    }
    
    protected function scrapeGQStreetware()
    {
        try {
            $response = $this->client->get('https://www.revistagq.com/tags/streetwear');
            $html = $response->getBody()->getContents();
            $crawler = new Crawler($html);
            
            $articles = [];
            
            $crawler->filter('.article-item, .card-article')->each(function (Crawler $node) use (&$articles) {
                try {
                    $title = $node->filter('h2, h3, .article-title')->first();
                    $link = $node->filter('a')->first();
                    $image = $node->filter('img')->first();
                    $date = $node->filter('.date, .article-date, time')->first();
                    
                    if ($title->count() && $link->count()) {
                        $articles[] = [
                            'title' => trim($title->text()),
                            'url' => $this->resolveUrl($link->attr('href'), 'https://www.revistagq.com'),
                            'image' => $image->count() ? $this->resolveUrl($image->attr('src'), 'https://www.revistagq.com') : $this->getDefaultImage(),
                            'category' => 'STREETWEAR',
                            'date' => $date->count() ? $this->parseDate($date->text()) : date('Y-m-d'),
                            'source' => 'GQ España'
                        ];
                    }
                } catch (\Exception $e) {
                    Log::warning('Error parsing GQ article: ' . $e->getMessage());
                }
            });
            
            return array_slice($articles, 0, 4);
            
        } catch (\Exception $e) {
            Log::error('Error scraping GQ: ' . $e->getMessage());
            return [];
        }
    }
    
    protected function scrapeHighsnobiety()
    {
        try {
            $response = $this->client->get('https://www.highsnobiety.com/fashion/');
            $html = $response->getBody()->getContents();
            $crawler = new Crawler($html);
            
            $articles = [];
            
            $crawler->filter('article, .post-item, .card')->each(function (Crawler $node) use (&$articles) {
                try {
                    $title = $node->filter('h1, h2, h3, .post-title')->first();
                    $link = $node->filter('a')->first();
                    $image = $node->filter('img')->first();
                    $date = $node->filter('time, .date')->first();
                    
                    if ($title->count() && $link->count()) {
                        $articles[] = [
                            'title' => trim($title->text()),
                            'url' => $this->resolveUrl($link->attr('href'), 'https://www.highsnobiety.com'),
                            'image' => $image->count() ? $this->resolveUrl($image->attr('src'), 'https://www.highsnobiety.com') : $this->getDefaultImage(),
                            'category' => 'FASHION',
                            'date' => $date->count() ? $this->parseDate($date->attr('datetime') ?: $date->text()) : date('Y-m-d'),
                            'source' => 'Highsnobiety'
                        ];
                    }
                } catch (\Exception $e) {
                    Log::warning('Error parsing Highsnobiety article: ' . $e->getMessage());
                }
            });
            
            return array_slice($articles, 0, 3);
            
        } catch (\Exception $e) {
            Log::error('Error scraping Highsnobiety: ' . $e->getMessage());
            return [];
        }
    }
    
    protected function scrapeHypebeast()
    {
        try {
            $response = $this->client->get('https://hypebeast.com/fashion');
            $html = $response->getBody()->getContents();
            $crawler = new Crawler($html);
            
            $articles = [];
            
            $crawler->filter('.post-box, .post-item')->each(function (Crawler $node) use (&$articles) {
                try {
                    $title = $node->filter('h2, h3, .post-title')->first();
                    $link = $node->filter('a')->first();
                    $image = $node->filter('img')->first();
                    $date = $node->filter('.date, time')->first();
                    
                    if ($title->count() && $link->count()) {
                        $articles[] = [
                            'title' => trim($title->text()),
                            'url' => $this->resolveUrl($link->attr('href'), 'https://hypebeast.com'),
                            'image' => $image->count() ? $this->resolveUrl($image->attr('src'), 'https://hypebeast.com') : $this->getDefaultImage(),
                            'category' => 'SNEAKERS',
                            'date' => $date->count() ? $this->parseDate($date->text()) : date('Y-m-d'),
                            'source' => 'Hypebeast'
                        ];
                    }
                } catch (\Exception $e) {
                    Log::warning('Error parsing Hypebeast article: ' . $e->getMessage());
                }
            });
            
            return array_slice($articles, 0, 3);
            
        } catch (\Exception $e) {
            Log::error('Error scraping Hypebeast: ' . $e->getMessage());
            return [];
        }
    }
    
    protected function resolveUrl($url, $baseUrl)
    {
        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }
        
        return rtrim($baseUrl, '/') . '/' . ltrim($url, '/');
    }
    
    protected function parseDate($dateString)
    {
        try {
            return date('Y-m-d', strtotime($dateString));
        } catch (\Exception $e) {
            return date('Y-m-d');
        }
    }
    
    protected function getDefaultImage()
    {
        return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&h=400&fit=crop';
    }
}
