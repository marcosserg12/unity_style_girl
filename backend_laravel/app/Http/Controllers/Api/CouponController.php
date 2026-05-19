<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (! $coupon) {
            return response()->json(['message' => 'Cupom inválido.'], 422);
        }

        if (! $coupon->isValidForUser($request->user()->id)) {
            if (! $coupon->is_active) {
                return response()->json(['message' => 'Cupom desativado.'], 422);
            }
            if ($coupon->expires_at && $coupon->expires_at->isPast()) {
                return response()->json(['message' => 'Cupom expirado.'], 422);
            }
            return response()->json(['message' => 'Você já utilizou este cupom.'], 422);
        }

        return response()->json([
            'code'                => $coupon->code,
            'discount_percentage' => $coupon->discount_percentage,
        ]);
    }
}
