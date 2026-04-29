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

    private const DEFAULT_MARQUEE = [
        '✦ NOVA COLEÇÃO VERÃO 2025',
        '✦ FRETE PARA BRASÍLIA E DF',
        '✦ GANHE UMA BOLSA EXCLUSIVA EM COMPRAS ACIMA DE R$299,99',
        '✦ ATENDIMENTO VIA WHATSAPP',
    ];

    public function index(): JsonResponse
    {
        $path       = Setting::get('mega_menu_image');
        $marqueeRaw = Setting::get('marquee_items');
        $marquee    = $marqueeRaw ? json_decode($marqueeRaw, true) : self::DEFAULT_MARQUEE;

        return response()->json([
            'mega_menu_image'    => $path ? asset('storage/' . $path) : null,
            'mega_menu_caption1' => Setting::get('mega_menu_caption1', 'explore'),
            'mega_menu_caption2' => Setting::get('mega_menu_caption2', 'Nova Coleção 2025'),
            'marquee_items'      => $marquee,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'mega_menu_image'    => ['nullable', 'image', 'max:2048'],
            'mega_menu_caption1' => ['nullable', 'string', 'max:100'],
            'mega_menu_caption2' => ['nullable', 'string', 'max:100'],
            'marquee_items'      => ['nullable', 'array'],
            'marquee_items.*'    => ['string', 'max:200'],
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

        if ($request->has('marquee_items')) {
            Setting::set('marquee_items', json_encode($request->input('marquee_items')));
        }

        return response()->json(['message' => 'Configurações salvas.']);
    }
}
