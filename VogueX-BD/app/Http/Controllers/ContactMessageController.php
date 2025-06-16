<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactMessageController extends Controller
{
    /**
     * Almacenar un nuevo mensaje de contacto
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000'
        ]);

        $contactMessage = ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mensaje enviado correctamente. Te responderemos pronto.',
            'data' => $contactMessage
        ], 201);
    }

    /**
     * Obtener todos los mensajes (solo para administradores)
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::orderBy('created_at', 'desc');

        // Filtrar por estado si se especifica
        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'read') {
                $query->read();
            }
        }

        $messages = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $messages,
            'unread_count' => ContactMessage::unread()->count()
        ]);
    }

    /**
     * Obtener un mensaje específico
     */
    public function show($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        
        // Marcar como leído si no lo está
        if (!$message->is_read) {
            $message->markAsRead();
        }

        return response()->json([
            'success' => true,
            'data' => $message
        ]);
    }

    /**
     * Marcar mensaje como leído
     */
    public function markAsRead($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Mensaje marcado como leído'
        ]);
    }

    /**
     * Marcar mensaje como no leído
     */
    public function markAsUnread($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->update([
            'is_read' => false,
            'read_at' => null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mensaje marcado como no leído'
        ]);
    }

    /**
     * Eliminar un mensaje
     */
    public function destroy($id): JsonResponse
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mensaje eliminado correctamente'
        ]);
    }

    /**
     * Obtener estadísticas de mensajes
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => ContactMessage::count(),
                'unread' => ContactMessage::unread()->count(),
                'read' => ContactMessage::read()->count(),
                'today' => ContactMessage::whereDate('created_at', today())->count(),
                'this_week' => ContactMessage::whereBetween('created_at', [
                    now()->startOfWeek(),
                    now()->endOfWeek()
                ])->count(),
                'this_month' => ContactMessage::whereBetween('created_at', [
                    now()->startOfMonth(),
                    now()->endOfMonth()
                ])->count()
            ]
        ]);
    }
}
