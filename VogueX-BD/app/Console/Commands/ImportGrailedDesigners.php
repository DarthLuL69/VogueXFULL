<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GrailedDesignerBatchImporter;
use App\Models\Designer;

class ImportGrailedDesigners extends Command
{
    /**
     * El nombre y la firma del comando.
     *
     * @var string
     */
    protected $signature = 'designers:import-grailed {--limit=1000 : Número máximo de diseñadores a importar}';

    /**
     * La descripción del comando.
     *
     * @var string
     */
    protected $description = 'Importa diseñadores desde la API de Grailed';

    /**
     * Ejecutar el comando.
     */
    public function handle(GrailedDesignerBatchImporter $importer)
    {
        $startTime = now();
        $startCount = Designer::count();
        
        $this->info('Iniciando importación de diseñadores desde Grailed API.');
        $this->info("Diseñadores existentes antes de importar: {$startCount}");
        
        // Mostrar un indicador de progreso
        $this->output->progressStart(100);
        
        // Ejecutar la importación
        $result = $importer->importDesigners();
        
        // Completar el indicador de progreso
        $this->output->progressFinish();
        
        $endCount = Designer::count();
        $endTime = now();
        $duration = $endTime->diffInSeconds($startTime);
        
        // Mostrar resultados
        $this->info("\nImportación completada en {$duration} segundos.");
        $this->info("Procesados: {$result['processed']}");
        $this->info("Creados: {$result['created']}");
        $this->info("Actualizados: {$result['updated']}");
        $this->info("Errores: {$result['errors']}");
        $this->info("Total de diseñadores en la base de datos: {$endCount}");
        
        return 0;
    }
}
