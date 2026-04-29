<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSize;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSizeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AppSize::orderBy('display_order')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'          => ['required', 'string', 'max:20'],
            'display_order' => ['nullable', 'integer'],
        ]);
        return response()->json(AppSize::create($request->only('name', 'display_order')), 201);
    }

    public function update(Request $request, AppSize $size): JsonResponse
    {
        $request->validate([
            'name'          => ['required', 'string', 'max:20'],
            'display_order' => ['nullable', 'integer'],
        ]);
        $size->update($request->only('name', 'display_order'));
        return response()->json($size);
    }

    public function destroy(AppSize $size): JsonResponse
    {
        $size->delete();
        return response()->json(['message' => 'Tamanho removido.']);
    }
}
