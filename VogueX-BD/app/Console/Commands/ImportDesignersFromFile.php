<?php

namespace App\Console\Commands;

use App\Models\Designer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ImportDesignersFromFile extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'designers:import-from-file';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa diseñadores desde un archivo de texto local';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Iniciando importación de diseñadores desde archivo...');
        
        // Registrar hora de inicio
        $startTime = microtime(true);
        
        // Ruta al archivo de diseñadores
        $filePath = base_path('../DISEÑADORES.txt');
        
        if (!file_exists($filePath)) {
            $this->error('El archivo de diseñadores no existe en la ruta: ' . $filePath);
            return 1;
        }
        
        // Leer el archivo
        $designers = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        $this->info('Se encontraron ' . count($designers) . ' diseñadores en el archivo.');
        
        $processed = 0;
        $created = 0;
        $updated = 0;
        $errors = 0;
        
        // Barra de progreso
        $bar = $this->output->createProgressBar(count($designers));
        $bar->start();
        
        // Ejecutar la importación dentro de una transacción
        DB::beginTransaction();
        
        try {
            // Obtener diseñadores existentes para evitar duplicados
            $existingDesigners = Designer::pluck('name')->toArray();
            $existingDesigners = array_map('strtolower', $existingDesigners);
            
            foreach ($designers as $designerName) {
                $processed++;
                
                // Omitir líneas vacías
                if (empty(trim($designerName))) {
                    $bar->advance();
                    continue;
                }
                
                // Verificar si ya existe (independientemente de mayúsculas/minúsculas)
                if (in_array(strtolower($designerName), $existingDesigners)) {
                    $updated++;
                    $bar->advance();
                    continue;
                }
                
                try {
                    // Crear nuevo diseñador
                    Designer::create([
                        'name' => $designerName,
                        'slug' => Str::slug($designerName),
                        'description' => 'Diseñador de moda',
                        'is_popular' => false,
                        'is_featured' => false,
                        'categories' => ['moda'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                    
                    $created++;
                    $existingDesigners[] = strtolower($designerName);
                    
                } catch (\Exception $e) {
                    Log::error("Error al crear diseñador {$designerName}: " . $e->getMessage());
                    $errors++;
                }
                
                $bar->advance();
            }
            
            DB::commit();
            $bar->finish();
            $this->newLine(2);
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('Error de base de datos: ' . $e->getMessage());
            return 1;
        }
        
        // Calcular tiempo de ejecución
        $executionTime = round(microtime(true) - $startTime, 2);
        
        $this->info("Importación completada en {$executionTime} segundos:");
        $this->info("- Procesados: {$processed}");
        $this->info("- Creados: {$created}");
        $this->info("- Ya existían: {$updated}");
        $this->info("- Errores: {$errors}");
        $this->info("Total de diseñadores en la base de datos: " . Designer::count());
        
        return 0;
    }
}
