<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ShowTableStructure extends Command
{
    protected $signature = 'db:table-info {table}';
    protected $description = 'Show table structure information';

    public function handle()
    {
        $tableName = $this->argument('table');
        
        if (!Schema::hasTable($tableName)) {
            $this->error("Table '{$tableName}' does not exist.");
            return 1;
        }

        $this->info("Table: {$tableName}");
        $this->line('');
        
        // Obtener columnas
        $columns = Schema::getColumnListing($tableName);
        $this->info('Columns:');
        foreach ($columns as $column) {
            $this->line("  - {$column}");
        }
        
        $this->line('');
        
        // Obtener información detallada usando DESCRIBE
        try {
            $tableInfo = DB::select("DESCRIBE {$tableName}");
            $this->info('Detailed Structure:');
            $this->table(
                ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'],
                array_map(function($column) {
                    return [
                        $column->Field,
                        $column->Type,
                        $column->Null,
                        $column->Key,
                        $column->Default,
                        $column->Extra
                    ];
                }, $tableInfo)
            );
        } catch (\Exception $e) {
            $this->error('Could not get detailed structure: ' . $e->getMessage());
        }

        return 0;
    }
}
