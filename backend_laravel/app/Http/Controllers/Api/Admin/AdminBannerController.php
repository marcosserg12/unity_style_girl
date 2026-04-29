<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminBannerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Banner::orderBy('display_order')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'          => ['required', 'string', 'max:200'],
            'subtitle'       => ['nullable', 'string', 'max:500'],
            'cta_text'       => ['nullable', 'string', 'max:100'],
            'cta_link'       => ['nullable', 'string', 'max:500'],
            'desktop_image'  => ['required', 'image', 'max:10240'],
            'mobile_image'   => ['nullable', 'image', 'max:10240'],
            'display_order'  => ['nullable', 'integer'],
            'is_active'      => ['nullable'],
            'show_badge'     => ['nullable'],
            'badge_label'    => ['nullable', 'string', 'max:100'],
            'badge_text'     => ['nullable', 'string', 'max:200'],
            'badge_subtext'  => ['nullable', 'string', 'max:200'],
            'disclaimer'     => ['nullable', 'string', 'max:400'],
            'text_position'  => ['nullable', 'in:left,right'],
            'eyebrow_text'   => ['nullable', 'string', 'max:100'],
        ]);

        $data = $request->only('title', 'subtitle', 'cta_text', 'cta_link', 'display_order',
            'badge_label', 'badge_text', 'badge_subtext', 'disclaimer', 'eyebrow_text');
        $data['is_active']     = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);
        $data['show_badge']    = filter_var($request->input('show_badge', false), FILTER_VALIDATE_BOOLEAN);
        $data['text_position'] = $request->input('text_position', 'left');
        $data['desktop_image'] = $request->file('desktop_image')->store('banners', 'public');

        if ($request->hasFile('mobile_image')) {
            $data['mobile_image'] = $request->file('mobile_image')->store('banners', 'public');
        }

        return response()->json(Banner::create($data), 201);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $request->validate([
            'title'          => ['required', 'string', 'max:200'],
            'subtitle'       => ['nullable', 'string', 'max:500'],
            'cta_text'       => ['nullable', 'string', 'max:100'],
            'cta_link'       => ['nullable', 'string', 'max:500'],
            'desktop_image'  => ['nullable', 'image', 'max:10240'],
            'mobile_image'   => ['nullable', 'image', 'max:10240'],
            'display_order'  => ['nullable', 'integer'],
            'is_active'      => ['nullable'],
            'show_badge'     => ['nullable'],
            'badge_label'    => ['nullable', 'string', 'max:100'],
            'badge_text'     => ['nullable', 'string', 'max:200'],
            'badge_subtext'  => ['nullable', 'string', 'max:200'],
            'disclaimer'     => ['nullable', 'string', 'max:400'],
            'text_position'  => ['nullable', 'in:left,right'],
            'eyebrow_text'   => ['nullable', 'string', 'max:100'],
            'clear_mobile'   => ['nullable'],
        ]);

        $data = $request->only('title', 'subtitle', 'cta_text', 'cta_link', 'display_order',
            'badge_label', 'badge_text', 'badge_subtext', 'disclaimer', 'eyebrow_text');
        $data['is_active']     = filter_var($request->input('is_active', $banner->is_active), FILTER_VALIDATE_BOOLEAN);
        $data['show_badge']    = filter_var($request->input('show_badge', $banner->show_badge), FILTER_VALIDATE_BOOLEAN);
        $data['text_position'] = $request->input('text_position', $banner->text_position ?? 'left');

        if ($request->hasFile('desktop_image')) {
            Storage::disk('public')->delete($banner->desktop_image);
            $data['desktop_image'] = $request->file('desktop_image')->store('banners', 'public');
        }

        if ($request->hasFile('mobile_image')) {
            if ($banner->mobile_image) Storage::disk('public')->delete($banner->mobile_image);
            $data['mobile_image'] = $request->file('mobile_image')->store('banners', 'public');
        } elseif (filter_var($request->input('clear_mobile', false), FILTER_VALIDATE_BOOLEAN)) {
            if ($banner->mobile_image) Storage::disk('public')->delete($banner->mobile_image);
            $data['mobile_image'] = null;
        }

        $banner->update($data);
        return response()->json($banner->fresh());
    }

    public function destroy(Banner $banner): JsonResponse
    {
        Storage::disk('public')->delete($banner->desktop_image);
        if ($banner->mobile_image) Storage::disk('public')->delete($banner->mobile_image);
        $banner->delete();
        return response()->json(['message' => 'Banner removido.']);
    }
}
