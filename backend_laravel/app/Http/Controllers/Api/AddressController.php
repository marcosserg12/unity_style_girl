<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()
            ->addresses()
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($addresses);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label'          => ['nullable', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:100'],
            'zip_code'       => ['required', 'string', 'max:20'],
            'street'         => ['required', 'string', 'max:200'],
            'number'         => ['required', 'string', 'max:20'],
            'complement'     => ['nullable', 'string', 'max:100'],
            'neighborhood'   => ['required', 'string', 'max:100'],
            'city'           => ['required', 'string', 'max:100'],
            'state'          => ['required', 'string', 'max:2'],
            'is_default'     => ['boolean'],
        ]);

        $user = $request->user();

        if ($user->addresses()->count() === 0) {
            $validated['is_default'] = true;
        } elseif (!empty($validated['is_default'])) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create($validated);

        return response()->json($address, 201);
    }

    public function setDefault(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $request->user()->addresses()->update(['is_default' => false]);
        $address->update(['is_default' => true]);

        return response()->json(['message' => 'Endereço padrão atualizado.']);
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $address->delete();

        return response()->json(['message' => 'Endereço removido.']);
    }
}
