<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\Client\Payment\PaymentClient;
use MercadoPago\MercadoPagoConfig;

class MercadoPagoService
{
    public function __construct()
    {
        MercadoPagoConfig::setAccessToken(config('mercadopago.access_token'));
        MercadoPagoConfig::setRuntimeEnviroment(
            config('mercadopago.sandbox')
                ? MercadoPagoConfig::LOCAL
                : MercadoPagoConfig::SERVER
        );
    }

    /**
     * Cria uma preferência de pagamento no Mercado Pago para o pedido.
     * Retorna o objeto com init_point e sandbox_init_point.
     */
    public function createPreference(Order $order, User $user): object
    {
        $order->loadMissing('items');

        $items = $order->items->map(fn($item) => [
            'id'          => (string) $item->id,
            'title'       => $item->product_snapshot['name'] ?? 'Produto',
            'description' => implode(' ', array_filter([
                $item->product_snapshot['color'] ?? null,
                $item->product_snapshot['size']  ?? null,
            ])),
            'quantity'    => (int) $item->quantity,
            'currency_id' => config('mercadopago.currency'),
            'unit_price'  => (float) $item->unit_price,
        ])->toArray();

        // Adiciona frete como item separado se houver custo
        if ((float) $order->shipping_cost > 0) {
            $items[] = [
                'id'          => 'shipping',
                'title'       => 'Frete',
                'quantity'    => 1,
                'currency_id' => config('mercadopago.currency'),
                'unit_price'  => (float) $order->shipping_cost,
            ];
        }

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');
        $appUrl      = rtrim(env('APP_URL', 'http://localhost:8000'), '/');
        $isLocalhost = str_contains($appUrl, 'localhost') || str_contains($appUrl, '127.0.0.1');

        $preferenceData = [
            'items'       => $items,
            'payer'       => [
                'name'  => $user->name,
                'email' => $user->email,
            ],
            'back_urls' => [
                'success' => "{$frontendUrl}/checkout/sucesso",
                'failure' => "{$frontendUrl}/checkout/falha",
                'pending' => "{$frontendUrl}/checkout/pendente",
            ],
            'external_reference'   => $order->order_number,
            'statement_descriptor' => config('mercadopago.statement_descriptor'),
            'payment_methods'      => [
                'installments' => config('mercadopago.installments'),
            ],
        ];

        if (!$isLocalhost) {
            $preferenceData['notification_url'] = $appUrl . '/api/v1/webhooks/mercadopago';
        }

        $client = new PreferenceClient();

        try {
            $preference = $client->create($preferenceData);
        } catch (\MercadoPago\Exceptions\MPApiException $e) {
            $body = $e->getApiResponse()->getContent();
            $msg  = $body['message'] ?? $body['error'] ?? 'Erro ao criar preferência no Mercado Pago.';
            throw new \RuntimeException($msg, (int) $e->getApiResponse()->getStatusCode(), $e);
        }

        return $preference;
    }

    /**
     * Processa o pagamento com os dados enviados pelo MP Brick (transparent checkout).
     * Funciona para cartão, PIX e boleto.
     */
    public function processPayment(array $formData, float $amount, string $orderNumber, string $userEmail): object
    {
        $client = new PaymentClient();

        $appUrl      = rtrim(env('APP_URL', 'http://localhost:8000'), '/');
        $isLocalhost = str_contains($appUrl, 'localhost') || str_contains($appUrl, '127.0.0.1');

        $payload = [
            'transaction_amount' => $amount,
            'external_reference' => $orderNumber,
            'description'        => 'Pedido ' . $orderNumber . ' - Unity Girl Style',
            'payer'              => array_merge(
                $formData['payer'] ?? [],
                ['email' => $userEmail]
            ),
        ];

        if (!$isLocalhost) {
            $payload['notification_url'] = $appUrl . '/api/v1/webhooks/mercadopago';
        }

        // Pagamento com cartão (contém token de tokenização)
        if (!empty($formData['token'])) {
            $payload['token']             = $formData['token'];
            $payload['installments']      = $formData['installments'] ?? 1;
            $payload['payment_method_id'] = $formData['payment_method_id'];
            if (!empty($formData['issuer_id'])) {
                $payload['issuer_id'] = $formData['issuer_id'];
            }
        }
        // PIX, boleto ou outro método sem token
        elseif (!empty($formData['payment_method_id'])) {
            $payload['payment_method_id'] = $formData['payment_method_id'];
        }

        try {
            return $client->create($payload);
        } catch (\MercadoPago\Exceptions\MPApiException $e) {
            $body = $e->getApiResponse()->getContent();
            $msg  = $body['message'] ?? $body['error'] ?? 'Erro no Mercado Pago.';
            throw new \RuntimeException($msg, (int) $e->getApiResponse()->getStatusCode(), $e);
        }
    }

    /**
     * Busca os detalhes de um pagamento pelo ID retornado pelo webhook.
     */
    public function getPayment(int|string $paymentId): object
    {
        $client = new PaymentClient();
        return $client->get((int) $paymentId);
    }
}
