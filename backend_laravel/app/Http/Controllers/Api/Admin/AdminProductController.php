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
            // 1. Cria o produto base (slug auto-gerado se não informado)
            $data = collect($validated)->except(['variants', 'images', 'primary_image_index', 'image_colors'])->toArray();
            if (empty($data['slug'])) {
                $data['slug'] = \Illuminate\Support\Str::slug($data['name']) . '-' . \Illuminate\Support\Str::random(4);
            }
            $product = Product::create($data);

            // 2. Cria todas as variações — SKU auto-gerado se não informado
            $variants = collect($validated['variants'])->map(fn($v) => [
                'product_id'      => $product->id,
                'sku'             => $v['sku'] ?? strtoupper(\Illuminate\Support\Str::slug($product->name)) . '-' . strtoupper(\Illuminate\Support\Str::slug($v['color'] ?? 'U')) . '-' . strtoupper($v['size'] ?? 'U') . '-' . \Illuminate\Support\Str::random(3),
                'size'            => $v['size'] ?? null,
                'color'           => $v['color'] ?? null,
                'color_hex'       => $v['color_hex'] ?? null,
                'stock_quantity'  => $v['stock_quantity'],
                'price_modifier'  => $v['price_modifier'] ?? 0,
                'min_stock_alert' => $v['min_stock_alert'] ?? 5,
                'is_active'       => true,
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();

            ProductVariant::insert($variants);

            // 3. Processa e armazena as imagens do produto
            if ($request->hasFile('images')) {
                $primaryIndex = $validated['primary_image_index'] ?? 0;
                $imageColors  = $validated['image_colors'] ?? [];

                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store("products/{$product->id}", 'public');

                    ProductImage::create([
                        'product_id'    => $product->id,
                        'path'          => $path,
                        'alt_text'      => $product->name,
                        'display_order' => $index,
                        'is_primary'    => $index === (int) $primaryIndex,
                        'color'         => $imageColors[$index] ?? null,
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
        $validated = $request->validated();

        $product = DB::transaction(function () use ($request, $validated, $product) {
            // 1. Update basic info
            $basicData = collect($validated)->except([
                'variants', 'new_images', 'primary_image_index', 
                'new_image_colors', 'delete_image_ids', 'primary_image_id'
            ])->toArray();
            
            $product->update($basicData);

            // 2. Sync variants
            if (isset($validated['variants'])) {
                $existingIds = collect($validated['variants'])->pluck('id')->filter()->toArray();
                
                // Remove variants not in the request
                ProductVariant::where('product_id', $product->id)
                    ->whereNotIn('id', $existingIds)
                    ->delete();

                foreach ($validated['variants'] as $v) {
                    $variantData = [
                        'size'           => $v['size'],
                        'color'          => $v['color'] ?? 'Único',
                        'color_hex'      => $v['color_hex'] ?? null,
                        'stock_quantity' => $v['stock_quantity'],
                    ];

                    if (!empty($v['id'])) {
                        ProductVariant::where('id', $v['id'])->update($variantData);
                    } else {
                        $product->variants()->create([
                            ...$variantData,
                            'sku'       => strtoupper(\Illuminate\Support\Str::slug($product->name)) . '-' . \Illuminate\Support\Str::random(4),
                            'is_active' => true
                        ]);
                    }
                }
            }

            // 3. Process new images
            if ($request->hasFile('new_images')) {
                $newImageColors = $validated['new_image_colors'] ?? [];
                $baseOrder = ProductImage::where('product_id', $product->id)->count();
                
                foreach ($request->file('new_images') as $index => $image) {
                    $path = $image->store("products/{$product->id}", 'public');
                    $color = $newImageColors[$index] ?? null;

                    ProductImage::create([
                        'product_id'    => $product->id,
                        'path'          => $path,
                        'alt_text'      => $product->name . ($color ? " - $color" : ""),
                        'color'         => $color,
                        'display_order' => $baseOrder + $index,
                        'is_primary'    => false,
                    ]);
                }
            }

            // 4. Delete removed images
            if (!empty($validated['delete_image_ids'])) {
                $toDelete = ProductImage::where('product_id', $product->id)
                    ->whereIn('id', $validated['delete_image_ids'])
                    ->get();
                foreach ($toDelete as $img) {
                    Storage::disk('public')->delete($img->path);
                    $img->delete();
                }
            }

            // 5. Update primary image
            if (!empty($validated['primary_image_id'])) {
                ProductImage::where('product_id', $product->id)->update(['is_primary' => false]);
                ProductImage::where('id', $validated['primary_image_id'])
                    ->where('product_id', $product->id)
                    ->update(['is_primary' => true]);
            } elseif (isset($validated['primary_image_index'])) {
                ProductImage::where('product_id', $product->id)->update(['is_primary' => false]);
                $allImages = ProductImage::where('product_id', $product->id)
                    ->orderBy('display_order')->get();
                $target = $allImages[$validated['primary_image_index']] ?? null;
                if ($target) $target->update(['is_primary' => true]);
            }

            return $product;
        });

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

    public function updateFlag(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'field' => ['required', 'in:is_featured,is_new_arrival,is_active'],
            'value' => ['required', 'boolean'],
        ]);

        $product->update([$request->field => $request->value]);

        return response()->json([
            'message' => 'Produto atualizado.',
            'product' => $product->only(['id', 'is_featured', 'is_new_arrival', 'is_active']),
        ]);
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
