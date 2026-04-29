<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $path = Setting::get('mega_menu_image');
        return response()->json([
            'mega_menu_image'    => $path ? asset('storage/' . $path) : null,
            'mega_menu_caption1' => Setting::get('mega_menu_caption1', 'explore'),
            'mega_menu_caption2' => Setting::get('mega_menu_caption2', 'Nova Coleção 2025'),
        ]);
    }
}
