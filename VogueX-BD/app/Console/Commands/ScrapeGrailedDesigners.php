<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GrailedScraperService;

class ScrapeGrailedDesigners extends Command
{
    protected $signature = 'grailed:scrape-designers {--limit=100 : Limit number of pages to scrape}';
    protected $description = 'Scrape designers from Grailed and save to database';

    protected $scraperService;

    public function __construct(GrailedScraperService $scraperService)
    {
        parent::__construct();
        $this->scraperService = $scraperService;
    }

    public function handle()
    {
        $this->info('Starting Grailed designers scrape...');
        
        $limit = $this->option('limit');
        $this->info("Scraping up to {$limit} pages...");
        
        try {
            $result = $this->scraperService->scrapeAllDesigners();
            
            $this->info("Scrape completed successfully!");
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Created', $result['created']],
                    ['Updated', $result['updated']],
                    ['Total', $result['total']]
                ]
            );
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error during scraping: ' . $e->getMessage());
            return 1;
        }
    }
}
