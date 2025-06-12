<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GrailedDesignerPageScraper;

class ScrapeGrailedDesignerPage extends Command
{
    protected $signature = 'grailed:scrape-designer-page';
    protected $description = 'Scrape all designers from Grailed designers page';

    protected $scraperService;

    public function __construct(GrailedDesignerPageScraper $scraperService)
    {
        parent::__construct();
        $this->scraperService = $scraperService;
    }

    public function handle()
    {
        $this->info('Starting Grailed designer page scrape...');
        
        try {
            $result = $this->scraperService->scrapeAllDesigners();
            
            $this->info("Scrape completed successfully!");
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Created', $result['created']],
                    ['Updated', $result['updated']],
                    ['Errors', $result['errors']],
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
