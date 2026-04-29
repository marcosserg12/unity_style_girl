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
            ->with(['category', 'primaryImage', 'activeVariants'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['category'])) {
            $query->where('category_id', $filters['category']);
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

        $sort = match($filters['sort'] ?? 'newest') {
            'price_asc'  => ['price', 'asc'],
            'price_desc' => ['price', 'desc'],
            'name_asc'   => ['name', 'asc'],
            default      => ['created_at', 'desc'],
        };

        return $query->orderBy(...$sort)->paginate($perPage);
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
            ->with(['primaryImage', 'activeVariants'])
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

    public function getLowStockProducts(int $limit = 20): Collection
    {
        return $this->model->active()
            ->whereHas('variants', fn($q) => $q->lowStock())
            ->with(['primaryImage', 'variants' => fn($q) => $q->lowStock()])
            ->limit($limit)
            ->get();
    }
}
