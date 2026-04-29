<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Banner extends Model
{
    protected $fillable = [
        'title', 'subtitle', 'cta_text', 'cta_link',
        'desktop_image', 'mobile_image',
        'display_order', 'is_active', 'starts_at', 'ends_at',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'starts_at'  => 'datetime',
        'ends_at'    => 'datetime',
    ];

    protected $appends = ['desktop_url', 'mobile_url'];

    public function scopeActive($query)
    {
        $now = Carbon::now();
        return $query->where('is_active', true)
                     ->where(fn($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
                     ->where(fn($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now))
                     ->orderBy('display_order');
    }

    public function getDesktopUrlAttribute(): string
    {
        return asset('storage/' . $this->desktop_image);
    }

    public function getMobileUrlAttribute(): ?string
    {
        return $this->mobile_image ? asset('storage/' . $this->mobile_image) : null;
    }
}
