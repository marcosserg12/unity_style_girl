<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index(): JsonResponse
    {
        $coupons = Coupon::withCount('usages')->latest()->get();
        return response()->json($coupons);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'                => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'discount_percentage' => ['required', 'integer', 'min:1', 'max:100'],
            'is_active'           => ['boolean'],
            'expires_at'          => ['nullable', 'date', 'after:now'],
            'payment_method'      => ['nullable', 'in:pix,credit_card'],
        ]);

        $data['code'] = strtoupper($data['code']);

        return response()->json(Coupon::create($data), 201);
    }

    public function toggle(Coupon $coupon): JsonResponse
    {
        $coupon->update(['is_active' => ! $coupon->is_active]);
        return response()->json($coupon->fresh());
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();
        return response()->json(['message' => 'Cupom excluído.']);
    }
}
