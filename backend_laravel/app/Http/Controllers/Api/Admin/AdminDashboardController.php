<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Repositories\OrderRepository;
use App\Repositories\ProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(
        private readonly OrderRepository   $orderRepository,
        private readonly ProductRepository $productRepository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $period = $request->get('period', '30d');

        $stats = $this->orderRepository->getSalesStats($period);

        return response()->json([
            'sales'           => $stats,
            'total_customers' => User::where('role', 'customer')->count(),
            'total_products'  => Product::active()->count(),
            'total_orders'    => Order::count(),
            'pending_orders'  => Order::where('status', 'pending')->count(),
            'low_stock'       => $this->productRepository->getLowStockVariants(2),
            'recent_orders'   => Order::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map->append('status_label'),
        ]);
    }
}
