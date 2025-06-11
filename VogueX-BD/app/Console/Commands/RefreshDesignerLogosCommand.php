<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Designer;
use App\Services\LogoFetcherService;

class RefreshDesignerLogosCommand extends Command
{
    protected $signature = 'designers:refresh-logos';
    protected $description = 'Refresh designer logos using multiple sources';

    protected $logoFetcher;

    public function __construct(LogoFetcherService $logoFetcher)
    {
        parent::__construct();
        $this->logoFetcher = $logoFetcher;
    }

    public function handle()
    {
        $this->info('Refreshing designer logos...');
        
        $designers = Designer::all();
        $bar = $this->output->createProgressBar($designers->count());
        
        foreach ($designers as $designer) {
            $newLogo = $this->logoFetcher->getDesignerLogo($designer->name);
            
            if ($newLogo !== $designer->image_url) {
                $designer->update(['image_url' => $newLogo]);
                $this->line("Updated logo for: {$designer->name}");
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->info("\nLogo refresh completed!");
    }
}
