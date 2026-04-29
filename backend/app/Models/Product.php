<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id', 'name', 'slug', 'short_description', 'description',
        'price', 'sale_price', 'cost_price', 'weight',
        'is_featured', 'is_new_arrival', 'is_active',
        'meta_title', 'meta_description',
    ];

    protected $casts = [
        'price'          => 'decimal:2',
        'sale_price'     => 'decimal:2',
        'cost_price'     => 'decimal:2',
        'weight'         => 'decimal:3',
        'is_featured'    => 'boolean',
        'is_new_arrival' => 'boolean',
        'is_active'      => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('display_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function activeVariants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->where('is_active', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeNewArrivals($query)
    {
        return $query->where('is_new_arrival', true);
    }

    public function getCurrentPriceAttribute(): float
    {
        return $this->sale_price ?? $this->price;
    }

    public function getIsOnSaleAttribute(): bool
    {
        return $this->sale_price !== null && $this->sale_price < $this->price;
    }

    public function getDiscountPercentageAttribute(): ?int
    {
        if (!$this->is_on_sale) return null;
        return (int) round((($this->price - $this->sale_price) / $this->price) * 100);
    }

    public function getTotalStockAttribute(): int
    {
        return $this->variants->sum('stock_quantity');
    }
}
