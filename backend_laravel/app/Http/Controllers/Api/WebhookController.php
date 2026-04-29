<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(private readonly MercadoPagoService $mercadoPago) {}

    /**
     * POST /api/v1/webhooks/mercadopago
     *
     * Recebe notificações do Mercado Pago e atualiza o status do pedido.
     * Rota pública — sem middleware de autenticação.
     */
    public function mercadopago(Request $request): Response
    {
        $type = $request->input('type') ?? $request->input('topic');

        // Só processamos notificações de pagamento
        if ($type !== 'payment') {
            return response('', 200);
        }

        $paymentId = $request->input('data.id');

        if (!$paymentId) {
            return response('', 200);
        }

        try {
            $payment = $this->mercadoPago->getPayment($paymentId);

            $order = Order::where('order_number', $payment->external_reference)->first();

            if (!$order) {
                Log::warning('MP Webhook: pedido não encontrado', ['ref' => $payment->external_reference]);
                return response('', 200);
            }

            match ($payment->status) {
                'approved' => $this->markPaid($order, $payment, $paymentId),
                'rejected', 'cancelled' => $this->markFailed($order),
                default    => null,
            };

        } catch (\Throwable $e) {
            Log::error('MP Webhook error', ['error' => $e->getMessage(), 'payment_id' => $paymentId]);
        }

        // Sempre retorna 200 para o Mercado Pago parar de reenviar
        return response('', 200);
    }

    private function markPaid(Order $order, object $payment, string|int $paymentId): void
    {
        if ($order->payment_status === 'paid') return;

        $order->update([
            'status'                 => 'paid',
            'payment_status'         => 'paid',
            'payment_transaction_id' => (string) $paymentId,
            'payment_method'         => $payment->payment_type_id ?? 'mercado_pago',
        ]);

        Log::info('MP Webhook: pedido pago', ['order' => $order->order_number]);
    }

    private function markFailed(Order $order): void
    {
        if (in_array($order->status, ['paid', 'processing', 'shipped', 'delivered'])) return;

        $order->update(['payment_status' => 'failed']);

        Log::info('MP Webhook: pagamento rejeitado', ['order' => $order->order_number]);
    }
}
