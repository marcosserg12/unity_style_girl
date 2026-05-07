<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Repositories\OrderRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    public function __construct(private readonly OrderRepository $repository) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status'   => ['nullable', 'in:pending,paid,processing,shipped,delivered,cancelled,refunded'],
            'search'   => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $orders = Order::with(['user', 'items'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, function ($q) use ($request) {
                $q->where('order_number', 'like', "%{$request->search}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', "%{$request->search}%")
                                                      ->orWhere('email', 'like', "%{$request->search}%"));
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 20));

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json(
            $order->load(['user', 'items'])
                  ->append('status_label')
        );
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status'        => ['required', 'in:pending,paid,processing,shipped,delivered,cancelled,refunded'],
            'tracking_code' => ['nullable', 'string', 'max:100'],
        ]);

        $newStatus = $request->status;

        // Statuses que indicam que o pedido foi confirmado (estoque deve ser consumido)
        $confirmingStatuses = ['paid', 'processing', 'shipped', 'delivered'];
        $stockConsumedStatuses = ['paid', 'processing', 'shipped', 'delivered'];

        DB::transaction(function () use ($order, $newStatus, $request, $confirmingStatuses, $stockConsumedStatuses) {
            $order->loadMissing('items');

            // Ao confirmar um pedido pendente: decrementa estoque (só se houver saldo)
            if (in_array($newStatus, $confirmingStatuses) && $order->status === 'pending') {
                foreach ($order->items as $item) {
                    if ($item->product_variant_id) {
                        ProductVariant::where('id', $item->product_variant_id)
                                      ->where('stock_quantity', '>=', $item->quantity)
                                      ->decrement('stock_quantity', $item->quantity);
                    }
                }
            }

            // Ao cancelar: restaura estoque apenas se já tinha sido confirmado (saiu do pending)
            if ($newStatus === 'cancelled' && $order->status !== 'cancelled') {
                if (in_array($order->status, $stockConsumedStatuses)) {
                    foreach ($order->items as $item) {
                        if ($item->product_variant_id) {
                            ProductVariant::where('id', $item->product_variant_id)
                                          ->increment('stock_quantity', $item->quantity);
                        }
                    }
                }
            }

            $data = ['status' => $newStatus];

            if ($newStatus === 'delivered') {
                $data['payment_status'] = 'paid';
            }

            if ($request->tracking_code) {
                $data['tracking_code'] = $request->tracking_code;
            }

            $order->update($data);
        });

        return response()->json([
            'message' => 'Status do pedido atualizado.',
            'order'   => $order->fresh()->append('status_label'),
        ]);
    }
}
