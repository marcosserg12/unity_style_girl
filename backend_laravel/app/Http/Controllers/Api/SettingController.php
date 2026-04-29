<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
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
}
