<?php

namespace App\Console\Commands;

use App\Models\Designer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SetFeaturedDesigners extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'designers:set-featured {--popular=25 : Número de diseñadores populares} {--featured=50 : Número de diseñadores destacados}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Establece aleatoriamente algunos diseñadores como populares y destacados';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $popular = $this->option('popular');
        $featured = $this->option('featured');
        
        $this->info("Estableciendo $popular diseñadores como populares y $featured como destacados...");
        
        // Restablecer todos los indicadores
        Designer::query()->update([
            'is_popular' => false,
            'is_featured' => false
        ]);
        
        // Establecer diseñadores populares aleatoriamente
        $designers = Designer::inRandomOrder()
            ->limit($popular)
            ->get();
            
        foreach ($designers as $designer) {
            $designer->is_popular = true;
            $designer->save();
        }
        
        $this->info("Establecidos $popular diseñadores como populares.");
        
        // Establecer diseñadores destacados aleatoriamente (evitar duplicados con populares)
        $designers = Designer::where('is_popular', false)
            ->inRandomOrder()
            ->limit($featured)
            ->get();
            
        foreach ($designers as $designer) {
            $designer->is_featured = true;
            $designer->save();
        }
        
        $this->info("Establecidos $featured diseñadores como destacados.");
        
        // Limpiar caché para forzar regeneración
        Cache::forget('designers_popular');
        Cache::forget('designers_featured');
        
        $this->info("Caché de diseñadores limpiada.");
        
        $this->info("Completado: {$popular} diseñadores populares y {$featured} diseñadores destacados establecidos.");
        return 0;
    }
}
