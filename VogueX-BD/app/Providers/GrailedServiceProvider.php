<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\GrailedApiService;
use App\Services\GrailedDesignerBatchImporter;
use App\Services\LogoFetcherService;

class GrailedServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Registrar LogoFetcherService
        $this->app->singleton(LogoFetcherService::class, function () {
            return new LogoFetcherService();
        });
        
        // Registrar GrailedApiService
        $this->app->singleton(GrailedApiService::class, function () {
            return new GrailedApiService();
        });
        
        // Registrar el importador de diseñadores
        $this->app->singleton(GrailedDesignerBatchImporter::class, function ($app) {
            return new GrailedDesignerBatchImporter(
                $app->make(GrailedApiService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
