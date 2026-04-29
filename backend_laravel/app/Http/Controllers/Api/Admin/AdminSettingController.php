<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminSettingController extends Controller
{
    private const TEXT_KEYS = ['mega_menu_caption1', 'mega_menu_caption2'];

    public function index(): JsonResponse
    {
        $path = Setting::get('mega_menu_image');
        return response()->json([
            'mega_menu_image'    => $path ? asset('storage/' . $path) : null,
            'mega_menu_caption1' => Setting::get('mega_menu_caption1', 'explore'),
            'mega_menu_caption2' => Setting::get('mega_menu_caption2', 'Nova Coleção 2025'),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'mega_menu_image'    => ['nullable', 'image', 'max:2048'],
            'mega_menu_caption1' => ['nullable', 'string', 'max:100'],
            'mega_menu_caption2' => ['nullable', 'string', 'max:100'],
        ]);

        if ($request->hasFile('mega_menu_image')) {
            $old = Setting::get('mega_menu_image');
            if ($old) Storage::disk('public')->delete($old);
            Setting::set('mega_menu_image', $request->file('mega_menu_image')->store('settings', 'public'));
        }

        foreach (self::TEXT_KEYS as $key) {
            if ($request->has($key)) {
                Setting::set($key, $request->input($key));
            }
        }

        return response()->json(['message' => 'Configurações salvas.']);
    }
}
