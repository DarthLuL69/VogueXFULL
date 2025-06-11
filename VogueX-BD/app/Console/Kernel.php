<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\SyncDesignersCommand::class,
        Commands\RecalculateDesignerCounts::class,
        Commands\ScrapeGrailedDesignersCommand::class,
        Commands\ScrapeGrailedDesignersPageCommand::class,
        Commands\RefreshDesignerLogosCommand::class, // Nuevo comando
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Ejecutar scrape de Grailed una vez por semana
        $schedule->command('grailed:scrape-designers')->weekly();
        
        // Recalcular contadores diariamente
        $schedule->command('designers:recalculate')->daily();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
