<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function getProfile()
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => ['email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        try {
            // Manejar la subida del avatar
            if ($request->hasFile('avatar')) {
                // Eliminar avatar anterior si existe
                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }

                // Guardar nuevo avatar
                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = $avatarPath;
            }

            // Actualizar el usuario
            $user->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Perfil actualizado exitosamente',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'bio' => $user->bio,
                    'role' => $user->role,
                    'created_at' => $user->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadAvatar(Request $request)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no autenticado'
            ], 401);
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            // Eliminar avatar anterior si existe
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Guardar nuevo avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            
            $user->update(['avatar' => $avatarPath]);

            return response()->json([
                'success' => true,
                'message' => 'Avatar actualizado exitosamente',
                'avatar_url' => $avatarPath
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al subir el avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
