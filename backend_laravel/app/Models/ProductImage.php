<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id', 'path', 'alt_text', 'display_order', 'is_primary', 'color',
    ];

    protected $casts = ['is_primary' => 'boolean'];

    protected $appends = ['url'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, 'http') || str_starts_with($this->path, '/')) {
            return $this->path;
        }
        return asset('storage/' . $this->path);
    }
}
