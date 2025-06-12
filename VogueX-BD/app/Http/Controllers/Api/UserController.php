<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getProfile()
    {
        // Por ahora devolvemos datos simulados
        // Cuando implementes autenticación, usarías auth()->user()
        return response()->json([
            'success' => true,
            'data' => [
                'id' => 1,
                'name' => 'Usuario Demo',
                'email' => 'demo@voguex.com',
                'avatar' => null,
                'created_at' => now(),
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|max:255',
        ]);

        // Aquí actualizarías el perfil del usuario
        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'data' => $validated
        ]);
    }
}
