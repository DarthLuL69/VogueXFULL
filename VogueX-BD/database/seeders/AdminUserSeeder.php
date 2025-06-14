<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Crear usuario administrador
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@voguex.com',
            'password' => Hash::make('admin12345'),
            'role' => 'admin',
        ]);

        // También podemos actualizar el usuario de prueba anterior para asegurarnos de que tiene el rol 'user'
        $testUser = User::where('email', 'test@example.com')->first();
        if ($testUser) {
            $testUser->update(['role' => 'user']);
        }
    }
}
