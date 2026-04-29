<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Repositories\ProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductRepository $repository) {}

    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category'    => ['nullable', 'exists:categories,slug'],
            'min_price'   => ['nullable', 'numeric', 'min:0'],
            'max_price'   => ['nullable', 'numeric', 'min:0'],
            'size'        => ['nullable', 'string'],
            'color'       => ['nullable', 'string'],
            'search'      => ['nullable', 'string', 'max:100'],
            'sort'        => ['nullable', 'in:newest,price_asc,price_desc,name_asc'],
            'per_page'    => ['nullable', 'integer', 'min:1', 'max:60'],
            'featured'    => ['nullable', 'boolean'],
            'new_arrivals'=> ['nullable', 'boolean'],
            'on_sale'     => ['nullable', 'boolean'],
        ]);

        $filters = $request->only(['category', 'min_price', 'max_price', 'size', 'color', 'search', 'sort', 'featured', 'new_arrivals', 'on_sale']);

        // Explicit cast for booleans from query string
        if (isset($filters['featured']))     $filters['featured']     = filter_var($filters['featured'],     FILTER_VALIDATE_BOOLEAN);
        if (isset($filters['new_arrivals'])) $filters['new_arrivals'] = filter_var($filters['new_arrivals'], FILTER_VALIDATE_BOOLEAN);
        if (isset($filters['on_sale']))      $filters['on_sale']      = filter_var($filters['on_sale'],      FILTER_VALIDATE_BOOLEAN);

        $products = $this->repository->paginate(
            $filters,
            $request->integer('per_page', 20)
        );

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = $this->repository->findBySlug($slug);
        $related = $this->repository->getRelated($product);

        return response()->json([
            'product' => $product->append(['is_on_sale', 'discount_percentage', 'total_stock']),
            'related' => $related,
        ]);
    }
}
