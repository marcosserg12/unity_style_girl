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
            'category'    => ['nullable', 'exists:categories,id'],
            'min_price'   => ['nullable', 'numeric', 'min:0'],
            'max_price'   => ['nullable', 'numeric', 'min:0'],
            'size'        => ['nullable', 'string'],
            'color'       => ['nullable', 'string'],
            'search'      => ['nullable', 'string', 'max:100'],
            'sort'        => ['nullable', 'in:newest,price_asc,price_desc,name_asc'],
            'per_page'    => ['nullable', 'integer', 'min:1', 'max:60'],
            'featured'    => ['nullable', 'boolean'],
            'new_arrivals'=> ['nullable', 'boolean'],
        ]);

        $products = $this->repository->paginate(
            $request->only(['category', 'min_price', 'max_price', 'size', 'color', 'search', 'sort', 'featured', 'new_arrivals']),
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
