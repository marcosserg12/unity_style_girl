<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Cart;
use App\Models\Order;
use App\Repositories\OrderRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderRepository $repository) {}

    public function index(Request $request): JsonResponse
    {
        $orders = Order::forUser($request->user()->id)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Pedido não encontrado.'], 404);
        }

        return response()->json($order->load('items')->append('status_label'));
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)
                    ->with(['items.variant.product'])
                    ->firstOrFail();

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'Seu carrinho está vazio.'], 422);
        }

        // Resolve endereço de entrega
        if ($request->address_id) {
            $address = $user->addresses()->findOrFail($request->address_id);
            $shippingAddress = $address->toShippingArray();
        } else {
            $shippingAddress = $request->shipping_address;
        }

        // Calcula totais
        $subtotal = $cart->total;
        $shippingCost = $this->calculateShipping($cart, $shippingAddress['zip_code'] ?? '');
        $discount = 0; // espaço para lógica de cupons
        $total = $subtotal + $shippingCost - $discount;

        $cartItems = $cart->items->map(fn($i) => [
            'variant_id' => $i->product_variant_id,
            'quantity'   => $i->quantity,
        ])->toArray();

        try {
            $order = $this->repository->createFromCart([
                'user_id'          => $user->id,
                'subtotal'         => $subtotal,
                'shipping_cost'    => $shippingCost,
                'discount_amount'  => $discount,
                'total'            => $total,
                'payment_method'   => $request->payment_method,
                'shipping_address' => $shippingAddress,
                'coupon_code'      => $request->coupon_code,
            ], $cartItems);

            // Limpa o carrinho após confirmação do pedido
            $cart->items()->delete();

            return response()->json([
                'message' => 'Pedido criado com sucesso!',
                'order'   => $order->append('status_label'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function calculateShipping(Cart $cart, string $zipCode): float
    {
        // Integração com API de frete (Correios/Melhor Envio) vai aqui
        // Por ora, lógica simplificada
        return 15.90;
    }
}
