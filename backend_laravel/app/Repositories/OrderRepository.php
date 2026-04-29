<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class OrderRepository
{
    public function createFromCart(array $data, array $cartItems): Order
    {
        return DB::transaction(function () use ($data, $cartItems) {
            $order = Order::create([
                ...$data,
                'order_number' => Order::generateOrderNumber(),
                'status'       => 'pending',
            ]);

            foreach ($cartItems as $item) {
                $variant = ProductVariant::lockForUpdate()->findOrFail($item['variant_id']);

                if ($variant->stock_quantity < $item['quantity']) {
                    throw new \Exception("Estoque insuficiente para {$variant->product->name} - {$variant->size}");
                }

                OrderItem::create([
                    'order_id'           => $order->id,
                    'product_id'         => $variant->product_id,
                    'product_variant_id' => $variant->id,
                    'quantity'           => $item['quantity'],
                    'unit_price'         => $variant->final_price,
                    'total_price'        => $variant->final_price * $item['quantity'],
                    'product_snapshot'   => [
                        'name'      => $variant->product->name,
                        'sku'       => $variant->sku,
                        'size'      => $variant->size,
                        'color'     => $variant->color,
                        'image_url' => $variant->product->primaryImage?->url,
                    ],
                ]);

                $variant->decrement('stock_quantity', $item['quantity']);
            }

            return $order->load('items');
        });
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);
        return $order->fresh();
    }

    public function getSalesStats(string $period = '30d'): array
    {
        $days = match($period) {
            '7d'  => 7,
            '30d' => 30,
            '90d' => 90,
            default => 30,
        };

        $start = now()->subDays($days);

        $base = Order::where('created_at', '>=', $start)
                     ->whereIn('payment_status', ['paid']);

        return [
            'total_revenue'  => (float) $base->sum('total'),
            'total_orders'   => $base->count(),
            'average_ticket' => (float) $base->avg('total'),
            'daily_revenue'  => $base->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as count')
                                     ->groupBy('date')
                                     ->orderBy('date')
                                     ->get(),
        ];
    }
}
