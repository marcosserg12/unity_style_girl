<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\ProductVariant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CancelOverdueOrders extends Command
{
    protected $signature   = 'orders:cancel-overdue';
    protected $description = 'Cancela pedidos pendentes com mais de 4 dias e restaura o estoque.';

    public function handle(): void
    {
        $cutoff = now()->subDays(4);

        $orders = Order::where('status', 'pending')
                       ->where('created_at', '<', $cutoff)
                       ->with('items')
                       ->get();

        if ($orders->isEmpty()) {
            $this->info('Nenhum pedido vencido encontrado.');
            return;
        }

        $count = 0;

        foreach ($orders as $order) {
            DB::transaction(function () use ($order) {
                // Restaura estoque de cada item
                foreach ($order->items as $item) {
                    if ($item->product_variant_id) {
                        ProductVariant::where('id', $item->product_variant_id)
                                      ->increment('stock_quantity', $item->quantity);
                    }
                }

                $order->update(['status' => 'cancelled']);
            });

            $count++;
            $this->line("Cancelado: {$order->order_number}");
        }

        $this->info("Total cancelados: {$count}");
    }
}
