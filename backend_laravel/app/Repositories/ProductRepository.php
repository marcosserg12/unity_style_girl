<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProductRepository
{
    public function __construct(private readonly Product $model) {}

    public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->active()
            ->with(['category', 'images', 'activeVariants']);

        if (!empty($filters['category'])) {
            $query->whereHas('category', fn($q) => $q->where('slug', $filters['category']));
        }

        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (!empty($filters['size'])) {
            $query->whereHas('activeVariants', fn($q) => $q->where('size', $filters['size']));
        }

        if (!empty($filters['color'])) {
            $query->whereHas('activeVariants', fn($q) => $q->where('color', $filters['color']));
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(fn($q) => $q->where('name', 'like', $search)
                                      ->orWhere('description', 'like', $search));
        }

        if (!empty($filters['featured'])) {
            $query->featured();
        }

        if (!empty($filters['new_arrivals'])) {
            $query->newArrivals();
        }

        if (!empty($filters['on_sale'])) {
            $query->whereNotNull('sale_price')->whereColumn('sale_price', '<', 'price');
        }

        [$sortCol, $sortDir] = match($filters['sort'] ?? 'newest') {
            'price_asc'  => ['price', 'asc'],
            'price_desc' => ['price', 'desc'],
            'name_asc'   => ['name', 'asc'],
            default      => ['created_at', 'desc'],
        };

        return $query->orderBy($sortCol, $sortDir)->paginate($perPage);
    }

    public function findBySlug(string $slug): ?Product
    {
        return $this->model->active()
            ->where('slug', $slug)
            ->with(['category', 'images', 'activeVariants'])
            ->firstOrFail();
    }

    public function getRelated(Product $product, int $limit = 4): Collection
    {
        return $this->model->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['images', 'activeVariants'])
            ->limit($limit)
            ->get();
    }

    public function create(array $data): Product
    {
        return $this->model->create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        return $product->fresh();
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    public function getLowStockVariants(int $threshold = 2): Collection
    {
        return \App\Models\ProductVariant::with(['product.primaryImage'])
            ->lowStock($threshold)
            ->where('is_active', true)
            ->whereHas('product', fn($q) => $q->where('is_active', true)->whereNull('deleted_at'))
            ->orderBy('stock_quantity', 'asc')
            ->get()
            ->map(fn($v) => [
                'variant_id'   => $v->id,
                'product_id'   => $v->product_id,
                'product_name' => $v->product?->name,
                'image_url'    => $v->product?->primaryImage?->url,
                'size'         => $v->size,
                'color'        => $v->color,
                'stock'        => $v->stock_quantity,
            ]);
    }
}
