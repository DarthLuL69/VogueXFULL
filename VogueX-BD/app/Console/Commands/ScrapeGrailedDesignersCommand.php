<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GrailedScraperService;

class ScrapeGrailedDesignersCommand extends Command
{
    protected $signature = 'grailed:scrape-designers {--limit=100 : Limit number of designers to scrape}';
    protected $description = 'Scrape designers from Grailed and add them to database';

    protected $scraperService;

    public function __construct(GrailedScraperService $scraperService)
    {
        parent::__construct();
        $this->scraperService = $scraperService;
    }

    public function handle()
    {
        $this->info('Starting Grailed designers scrape...');
        $this->info('This may take several minutes due to API rate limiting...');
        
        try {
            $result = $this->scraperService->scrapeAllDesigners();
            
            $this->info('Grailed scrape completed successfully!');
            $this->info("Created: {$result['created']} designers");
            $this->info("Updated: {$result['updated']} designers");
            $this->info("Total processed: {$result['total']} designers");
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error during scrape: ' . $e->getMessage());
            return 1;
        }
    }
}
