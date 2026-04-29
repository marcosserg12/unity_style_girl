<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'search'   => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $users = User::where('role', 'customer')
            ->when($request->search, function ($q) use ($request) {
                $q->where('name',  'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            })
            ->withCount('orders')
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return response()->json($users);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json(
            $user->load(['addresses', 'orders'])
        );
    }

    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message'   => $user->is_active ? 'Usuário ativado.' : 'Usuário desativado.',
            'is_active' => $user->is_active,
        ]);
    }
}
