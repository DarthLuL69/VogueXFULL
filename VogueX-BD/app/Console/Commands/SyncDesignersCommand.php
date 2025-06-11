<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DesignerDataService;

class SyncDesignersCommand extends Command
{
    protected $signature = 'designers:sync';
    protected $description = 'Sync designers data from external sources and store in database';

    protected $designerDataService;

    public function __construct(DesignerDataService $designerDataService)
    {
        parent::__construct();
        $this->designerDataService = $designerDataService;
    }

    public function handle()
    {
        $this->info('Starting designers sync...');
        
        try {
            $result = $this->designerDataService->syncDesignersFromExternalSources();
            
            $this->info('Designers sync completed successfully!');
            $this->info("Created: {$result['created']} designers");
            $this->info("Updated: {$result['updated']} designers");
            $this->info("Total processed: {$result['total']} designers");
            
            return 0;
        } catch (\Exception $e) {
            $this->error('Error during sync: ' . $e->getMessage());
            return 1;
        }
    }
}
