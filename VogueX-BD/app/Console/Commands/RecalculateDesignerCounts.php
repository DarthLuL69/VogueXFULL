<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Designer;

class RecalculateDesignerCounts extends Command
{
    protected $signature = 'designers:recalculate';
    protected $description = 'Recalculate product counts for all designers';

    public function handle()
    {
        $this->info('Recalculating designer product counts...');

        Designer::chunk(100, function ($designers) {
            foreach ($designers as $designer) {
                $count = $designer->products()->count();
                $designer->update(['items_count' => $count]);
                $this->line("Updated {$designer->name}: {$count} products");
            }
        });

        $this->info('Recalculation completed!');
    }
}
