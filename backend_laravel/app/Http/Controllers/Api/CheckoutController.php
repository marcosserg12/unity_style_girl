<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewOrderMail;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Repositories\OrderRepository;
use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly OrderRepository    $orderRepository,
        private readonly MercadoPagoService $mercadoPago,
    ) {}

    /**
     * POST /api/v1/checkout/whatsapp
     *
     * Cria o pedido no banco com status pendente e retorna o order_number.
     * O pagamento é combinado via WhatsApp — sem integração de gateway.
     */
    public function createWhatsAppOrder(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'customer_name'  => ['required', 'string', 'max:100'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'payment_method' => ['required', 'in:pix,credit_card'],
            'address_id'     => ['nullable', 'integer'],
            'street'         => ['nullable', 'string', 'max:200'],
            'number'         => ['nullable', 'string', 'max:20'],
            'complement'     => ['nullable', 'string', 'max:100'],
            'neighborhood'   => ['nullable', 'string', 'max:100'],
            'city'           => ['nullable', 'string', 'max:100'],
            'state'          => ['nullable', 'string', 'max:2'],
            'zip_code'       => ['nullable', 'string', 'max:20'],
            'save_address'   => ['boolean'],
            'coupon_code'    => ['nullable', 'string', 'max:50'],
        ]);

        $cart = $this->resolveCart($request, $user->id);

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Seu carrinho está vazio.'], 422);
        }

        // Resolve endereço de entrega
        $shippingAddress = [
            'recipient_name' => $validated['customer_name'],
            'whatsapp'       => $validated['customer_phone'],
        ];

        if (!empty($validated['address_id'])) {
            $addr = $user->addresses()->find($validated['address_id']);
            if ($addr) {
                $shippingAddress = array_merge($shippingAddress, $addr->toShippingArray());
            }
        } elseif (!empty($validated['street'])) {
            $addressData = [
                'street'       => $validated['street'],
                'number'       => $validated['number'] ?? '',
                'complement'   => $validated['complement'] ?? null,
                'neighborhood' => $validated['neighborhood'] ?? '',
                'city'         => $validated['city'] ?? '',
                'state'        => $validated['state'] ?? '',
                'zip_code'     => $validated['zip_code'] ?? '',
            ];
            $shippingAddress = array_merge($shippingAddress, $addressData);

            if (!empty($validated['save_address'])) {
                $isFirst = $user->addresses()->count() === 0;
                $user->addresses()->create(array_merge(
                    ['recipient_name' => $validated['customer_name'], 'is_default' => $isFirst],
                    $addressData
                ));
            }
        }

        $subtotal  = $cart->total;
        $cartItems = $cart->items->map(fn($i) => [
            'variant_id' => $i->product_variant_id,
            'quantity'   => $i->quantity,
        ])->toArray();

        // Resolve cupom
        $coupon         = null;
        $discountAmount = 0;

        if (!empty($validated['coupon_code'])) {
            $coupon = Coupon::where('code', strtoupper($validated['coupon_code']))->first();
            if ($coupon && $coupon->isValidForUser($user->id)) {
                $discountAmount = round($subtotal * $coupon->discount_percentage / 100, 2);
            } else {
                return response()->json(['message' => 'Cupom inválido ou já utilizado.'], 422);
            }
        }

        $finalTotal = max(0, $subtotal - $discountAmount);

        try {
            $order = $this->orderRepository->createFromCart([
                'user_id'          => $user->id,
                'subtotal'         => $subtotal,
                'shipping_cost'    => 0,
                'discount_amount'  => $discountAmount,
                'coupon_code'      => $coupon?->code,
                'total'            => $finalTotal,
                'payment_method'   => $validated['payment_method'],
                'shipping_address' => $shippingAddress,
            ], $cartItems);

            if ($coupon) {
                CouponUsage::create([
                    'coupon_id' => $coupon->id,
                    'user_id'   => $user->id,
                    'order_id'  => $order->id,
                ]);
            }

            $cart->items()->delete();

            $this->notifyStore($order);

            return response()->json([
                'order_number'    => $order->order_number,
                'total'           => (float) $order->total,
                'discount_amount' => (float) $discountAmount,
                'coupon_code'     => $coupon?->code,
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * POST /api/v1/checkout/preference
     *
     * 1. Resolve o carrinho (user_id OU session_token)
     * 2. Cria o pedido (frete = 0, combinado via WhatsApp)
     * 3. Cria a preferência no Mercado Pago
     * 4. Limpa o carrinho
     * 5. Retorna preference_id e total para o frontend montar o Brick
     */
    public function createPreference(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'shipping_address'                => ['required', 'array'],
            'shipping_address.recipient_name' => ['nullable', 'string', 'max:100'],
            'shipping_address.whatsapp'       => ['nullable', 'string', 'max:20'],
            'shipping_address.zip_code'       => ['required', 'string'],
            'shipping_address.street'         => ['required', 'string'],
            'shipping_address.number'         => ['required', 'string'],
            'shipping_address.complement'     => ['nullable', 'string'],
            'shipping_address.neighborhood'   => ['required', 'string'],
            'shipping_address.city'           => ['required', 'string'],
            'shipping_address.state'          => ['required', 'string', 'size:2'],
        ]);

        $cart = $this->resolveCart($request, $user->id);

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['message' => 'Seu carrinho está vazio.'], 422);
        }

        $subtotal  = $cart->total;
        $cartItems = $cart->items->map(fn($i) => [
            'variant_id' => $i->product_variant_id,
            'quantity'   => $i->quantity,
        ])->toArray();

        try {
            $order = $this->orderRepository->createFromCart([
                'user_id'          => $user->id,
                'subtotal'         => $subtotal,
                'shipping_cost'    => 0,
                'discount_amount'  => 0,
                'total'            => $subtotal,
                'payment_method'   => 'mercado_pago',
                'shipping_address' => $validated['shipping_address'],
            ], $cartItems);

            $preference = $this->mercadoPago->createPreference($order, $user);
            $order->update(['mp_preference_id' => $preference->id]);
            $cart->items()->delete();

            return response()->json([
                'order_number'  => $order->order_number,
                'preference_id' => $preference->id,
                'total'         => (float) $order->total,
            ], 201);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * POST /api/v1/checkout/pay
     *
     * Recebe o formData do MP Brick e processa o pagamento via API do Mercado Pago.
     */
    public function pay(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'order_number' => ['required', 'string', 'exists:orders,order_number'],
            'form_data'    => ['required', 'array'],
        ]);

        $order = Order::where('order_number', $validated['order_number'])
                      ->where('user_id', $user->id)
                      ->firstOrFail();

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Pedido já foi pago.'], 422);
        }

        \Log::info('checkout.pay', [
            'order'     => $order->order_number,
            'total'     => $order->total,
            'form_data' => $validated['form_data'],
        ]);

        try {
            $payment = $this->mercadoPago->processPayment(
                $validated['form_data'],
                (float) $order->total,
                $order->order_number,
                $user->email
            );

            // Atualiza o pedido com os dados do pagamento
            $order->update([
                'payment_transaction_id' => (string) $payment->id,
                'payment_method'         => $payment->payment_type_id ?? $payment->payment_method_id ?? 'mercado_pago',
                'payment_status'         => $payment->status === 'approved' ? 'paid' : 'pending',
                'status'                 => $payment->status === 'approved' ? 'paid' : 'pending',
            ]);

            if ($payment->status === 'approved') {
                $this->notifyStore($order->fresh(['items', 'user']));
            }

            $response = [
                'status'     => $payment->status,
                'payment_id' => $payment->id,
                'order_number' => $order->order_number,
            ];

            // PIX — devolve QR code para exibir na página
            if (isset($payment->point_of_interaction->transaction_data)) {
                $txData = $payment->point_of_interaction->transaction_data;
                $response['pix_qr_code']        = $txData->qr_code        ?? null;
                $response['pix_qr_code_base64'] = $txData->qr_code_base64 ?? null;
            }

            // Boleto
            if (isset($payment->transaction_details->external_resource_url)) {
                $response['ticket_url'] = $payment->transaction_details->external_resource_url;
            }

            return response()->json($response);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    private function notifyStore(Order $order): void
    {
        $to = config('mail.order_notify_email', env('ORDER_NOTIFY_EMAIL', 'unitygirlstyle@gmail.com'));
        try {
            Mail::to($to)->send(new NewOrderMail($order->loadMissing(['items', 'user'])));
        } catch (\Throwable $e) {
            \Log::error('NewOrderMail failed', ['order' => $order->order_number, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Resolve o carrinho pelo user_id OU pelo X-Cart-Token (carrinho de sessão).
     * Garante que itens adicionados antes do login também sejam encontrados.
     */
    private function resolveCart(Request $request, int $userId): ?Cart
    {
        $with = ['items.variant.product.primaryImage'];

        // 1. Tenta pelo user_id
        $cart = Cart::where('user_id', $userId)->with($with)->first();
        if ($cart && !$cart->items->isEmpty()) {
            return $cart;
        }

        // 2. Fallback: carrinho de sessão (adicionado antes do login)
        $cartToken = $request->header('X-Cart-Token');
        if ($cartToken) {
            $sessionCart = Cart::where('session_token', $cartToken)
                               ->whereNull('user_id')
                               ->with($with)
                               ->first();

            if ($sessionCart && !$sessionCart->items->isEmpty()) {
                // Associa o carrinho ao usuário para próximas operações
                $sessionCart->update(['user_id' => $userId, 'session_token' => null]);
                return $sessionCart->refresh()->load($with);
            }
        }

        return $cart; // pode ser null ou carrinho vazio do user
    }
}
