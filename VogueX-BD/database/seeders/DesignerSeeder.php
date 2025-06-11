<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\DesignerDataService;

class DesignerSeeder extends Seeder
{
    protected $designerDataService;

    public function __construct(DesignerDataService $designerDataService)
    {
        $this->designerDataService = $designerDataService;
    }

    public function run()
    {
        $this->command->info('Seeding designers...');
        
        $result = $this->designerDataService->syncDesignersFromExternalSources();
        
        $this->command->info("Designers seeded successfully!");
        $this->command->info("Created: {$result['created']}");
        $this->command->info("Updated: {$result['updated']}");
        $this->command->info("Total: {$result['total']}");
    }
}
