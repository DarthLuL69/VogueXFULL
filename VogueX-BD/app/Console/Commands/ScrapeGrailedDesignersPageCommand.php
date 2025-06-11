<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GrailedDesignersPageScraper;

class ScrapeGrailedDesignersPageCommand extends Command
{
    protected $signature = 'grailed:scrape-designers-page {--detailed : Show detailed output}';
    protected $description = 'Scrape all designers from Grailed designers page';

    protected $scraperService;

    public function __construct(GrailedDesignersPageScraper $scraperService)
    {
        parent::__construct();
        $this->scraperService = $scraperService;
    }

    public function handle()
    {
        if ($this->option('detailed')) {
            $this->info('Detailed mode enabled - comprehensive output will be shown');
        }
        
        $this->info('Starting comprehensive Grailed designers page scrape...');
        $this->info('This will extract ALL designers found on the page using multiple methods...');
        
        try {
            $result = $this->scraperService->scrapeAllDesignersFromPage();
            
            $this->info('✅ Scrape completed successfully!');
            $this->table(
                ['Metric', 'Count'],
                [
                    ['New designers created', $result['created']],
                    ['Existing designers updated', $result['updated']],
                    ['Total designers processed', $result['total']]
                ]
            );
            
            if ($this->option('detailed')) {
                $this->info('Checking database state...');
                $totalDesigners = \App\Models\Designer::count();
                $popularDesigners = \App\Models\Designer::where('is_popular', true)->count();
                
                $this->table(
                    ['Database Stats', 'Count'],
                    [
                        ['Total designers in DB', $totalDesigners],
                        ['Popular designers', $popularDesigners]
                    ]
                );
                
                $this->info('Recent designers added:');
                $recentDesigners = \App\Models\Designer::latest()->take(10)->pluck('name')->toArray();
                $this->line(implode(', ', $recentDesigners));
            }
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Error during scrape: ' . $e->getMessage());
            return 1;
        }
    }
}
