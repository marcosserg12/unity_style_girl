<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id', 'sku', 'size', 'color', 'color_hex',
        'stock_quantity', 'min_stock_alert', 'price_modifier', 'is_active',
    ];

    protected $casts = [
        'stock_quantity'  => 'integer',
        'min_stock_alert' => 'integer',
        'price_modifier'  => 'decimal:2',
        'is_active'       => 'boolean',
    ];

    protected $appends = ['final_price', 'is_low_stock', 'is_out_of_stock'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getFinalPriceAttribute(): float
    {
        $base = $this->product->sale_price ?? $this->product->price;
        return round($base + $this->price_modifier, 2);
    }

    public function getIsLowStockAttribute(): bool
    {
        return $this->stock_quantity > 0 && $this->stock_quantity <= $this->min_stock_alert;
    }

    public function getIsOutOfStockAttribute(): bool
    {
        return $this->stock_quantity === 0;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('stock_quantity', '<=', 'min_stock_alert')
                     ->where('stock_quantity', '>', 0);
    }
}
