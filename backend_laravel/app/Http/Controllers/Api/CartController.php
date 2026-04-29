<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);

        return response()->json(
            $cart->load(['items.variant.product.primaryImage'])
                 ->append(['total', 'item_count'])
        );
    }

    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'variant_id' => ['required', 'exists:product_variants,id'],
            'quantity'   => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        $variant = ProductVariant::active()->findOrFail($request->variant_id);

        if ($variant->stock_quantity < $request->quantity) {
            return response()->json(['message' => 'Quantidade indisponível em estoque.'], 422);
        }

        $cart = $this->resolveCart($request);

        $item = $cart->items()->firstOrNew(['product_variant_id' => $variant->id]);
        $newQty = ($item->quantity ?? 0) + $request->quantity;

        if ($newQty > $variant->stock_quantity) {
            return response()->json(['message' => 'Estoque insuficiente para esta quantidade.'], 422);
        }

        $item->quantity = $newQty;
        $item->save();

        return response()->json([
            'message'    => 'Produto adicionado ao carrinho.',
            'item_count' => $cart->fresh()->item_count,
            'cart_token' => $cart->session_token,
        ], 201);
    }

    public function update(Request $request, CartItem $item): JsonResponse
    {
        $this->authorizeCartItem($request, $item);

        $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
        ]);

        if ($request->quantity > $item->variant->stock_quantity) {
            return response()->json(['message' => 'Estoque insuficiente.'], 422);
        }

        $item->update(['quantity' => $request->quantity]);

        return response()->json(['message' => 'Carrinho atualizado.']);
    }

    public function remove(Request $request, CartItem $item): JsonResponse
    {
        $this->authorizeCartItem($request, $item);
        $item->delete();

        return response()->json(['message' => 'Item removido do carrinho.']);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $cart->items()->delete();

        return response()->json(['message' => 'Carrinho limpo.']);
    }

    private function resolveCart(Request $request): Cart
    {
        if ($request->user()) {
            return Cart::firstOrCreate(['user_id' => $request->user()->id]);
        }

        $token = $request->header('X-Cart-Token') ?: Str::uuid();

        return Cart::firstOrCreate(
            ['session_token' => $token],
            [],
        );
    }

    private function authorizeCartItem(Request $request, CartItem $item): void
    {
        $cart = $this->resolveCart($request);

        if ($item->cart_id !== $cart->id) {
            abort(403, 'Acesso negado a este item do carrinho.');
        }
    }
}
