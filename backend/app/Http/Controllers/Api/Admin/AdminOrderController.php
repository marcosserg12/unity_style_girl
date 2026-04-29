<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Repositories\OrderRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

        $data = ['status' => $request->status];

        if ($request->tracking_code) {
            $data['tracking_code'] = $request->tracking_code;
        }

        $order->update($data);

        return response()->json([
            'message' => 'Status do pedido atualizado.',
            'order'   => $order->fresh()->append('status_label'),
        ]);
    }
}
