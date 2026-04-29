<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id', 'path', 'alt_text', 'display_order', 'is_primary',
    ];

    protected $casts = ['is_primary' => 'boolean'];

    protected $appends = ['url'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }
}
