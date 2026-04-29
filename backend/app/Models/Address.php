<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Address extends Model
{
    protected $fillable = [
        'user_id', 'label', 'recipient_name', 'zip_code',
        'street', 'number', 'complement', 'neighborhood',
        'city', 'state', 'is_default',
    ];

    protected $casts = ['is_default' => 'boolean'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getFullAddressAttribute(): string
    {
        $parts = [
            "{$this->street}, {$this->number}",
            $this->complement,
            $this->neighborhood,
            "{$this->city} - {$this->state}",
            "CEP: {$this->zip_code}",
        ];
        return implode(', ', array_filter($parts));
    }

    public function toShippingArray(): array
    {
        return [
            'recipient_name' => $this->recipient_name,
            'zip_code'       => $this->zip_code,
            'street'         => $this->street,
            'number'         => $this->number,
            'complement'     => $this->complement,
            'neighborhood'   => $this->neighborhood,
            'city'           => $this->city,
            'state'          => $this->state,
        ];
    }
}
