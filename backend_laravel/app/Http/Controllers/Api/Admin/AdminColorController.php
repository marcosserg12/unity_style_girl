<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppColor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminColorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AppColor::orderBy('display_order')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'          => ['required', 'string', 'max:50'],
            'hex'           => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'display_order' => ['nullable', 'integer'],
        ]);
        return response()->json(AppColor::create($request->only('name', 'hex', 'display_order')), 201);
    }

    public function update(Request $request, AppColor $color): JsonResponse
    {
        $request->validate([
            'name'          => ['required', 'string', 'max:50'],
            'hex'           => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'display_order' => ['nullable', 'integer'],
        ]);
        $color->update($request->only('name', 'hex', 'display_order'));
        return response()->json($color);
    }

    public function destroy(AppColor $color): JsonResponse
    {
        $color->delete();
        return response()->json(['message' => 'Cor removida.']);
    }
}
