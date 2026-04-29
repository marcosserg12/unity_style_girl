<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Repositories\ProductRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    public function __construct(private readonly ProductRepository $repository) {}

    public function index(Request $request): JsonResponse
    {
        $products = Product::withTrashed()
            ->with(['category', 'primaryImage'])
            ->withCount('variants')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($products);
    }

    /**
     * Cria produto com variações e imagens em uma única transação atômica.
     * Se qualquer passo falhar, nenhuma alteração é persistida no banco.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $product = DB::transaction(function () use ($request, $validated) {
            // 1. Cria o produto base
            $product = Product::create(collect($validated)->except(['variants', 'images', 'primary_image_index'])->toArray());

            // 2. Cria todas as variações (SKUs com tamanho, cor e estoque)
            $variants = collect($validated['variants'])->map(fn($v) => [
                ...$v,
                'product_id'      => $product->id,
                'price_modifier'  => $v['price_modifier'] ?? 0,
                'min_stock_alert' => $v['min_stock_alert'] ?? 5,
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();

            ProductVariant::insert($variants);

            // 3. Processa e armazena as imagens do produto
            if ($request->hasFile('images')) {
                $primaryIndex = $validated['primary_image_index'] ?? 0;

                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store("products/{$product->id}", 'public');

                    ProductImage::create([
                        'product_id'    => $product->id,
                        'path'          => $path,
                        'alt_text'      => $product->name,
                        'display_order' => $index,
                        'is_primary'    => $index === $primaryIndex,
                    ]);
                }
            }

            return $product;
        });

        return response()->json([
            'message' => 'Produto criado com sucesso!',
            'product' => $product->load(['category', 'images', 'variants']),
        ], 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(
            $product->load(['category', 'images', 'variants'])
                    ->append(['is_on_sale', 'discount_percentage', 'total_stock'])
        );
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->repository->update($product, $request->validated());

        return response()->json([
            'message' => 'Produto atualizado com sucesso!',
            'product' => $product->load(['category', 'images', 'variants']),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->repository->delete($product);

        return response()->json(['message' => 'Produto removido com sucesso.']);
    }

    public function restore(int $id): JsonResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $product->restore();

        return response()->json(['message' => 'Produto restaurado com sucesso.']);
    }

    public function updateVariantStock(Request $request, ProductVariant $variant): JsonResponse
    {
        $request->validate([
            'quantity'   => ['required', 'integer'],
            'operation'  => ['required', 'in:set,increment,decrement'],
        ]);

        match ($request->operation) {
            'set'       => $variant->update(['stock_quantity' => max(0, $request->quantity)]),
            'increment' => $variant->increment('stock_quantity', $request->quantity),
            'decrement' => $variant->decrement('stock_quantity', min($request->quantity, $variant->stock_quantity)),
        };

        return response()->json([
            'message'        => 'Estoque atualizado.',
            'stock_quantity' => $variant->fresh()->stock_quantity,
        ]);
    }
}
