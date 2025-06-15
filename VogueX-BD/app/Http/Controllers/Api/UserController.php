<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{    public function getProfile()
    {
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
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado exitosamente',
            'data' => $validated
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Imagen de perfil actualizada exitosamente',
            'data' => [
                'avatar' => '/storage/avatars/demo-avatar.jpg'
            ]
        ]);
    }
}
