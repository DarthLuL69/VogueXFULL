<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Crear un usuario de prueba
        User::create([
            'name' => 'Usuario Prueba',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);
    }
}
