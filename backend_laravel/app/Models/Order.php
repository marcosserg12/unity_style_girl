<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status',
        'subtotal', 'shipping_cost', 'discount_amount', 'coupon_code', 'total',
        'payment_method', 'payment_status', 'payment_transaction_id',
        'shipping_address', 'tracking_code', 'notes',
    ];

    protected $appends = ['status_label'];

    protected $casts = [
        'subtotal'         => 'decimal:2',
        'shipping_cost'    => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'total'            => 'decimal:2',
        'shipping_address' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending'    => 'Aguardando Pagamento',
            'paid'       => 'Pagamento Confirmado',
            'processing' => 'Em Separação',
            'shipped'    => 'Enviado',
            'delivered'  => 'Entregue',
            'cancelled'  => 'Cancelado',
            'refunded'   => 'Reembolsado',
            default      => $this->status,
        };
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'paid']);
    }

    // Gera número único de pedido no formato UGS-2024-00001
    public static function generateOrderNumber(): string
    {
        $year  = date('Y');
        $last  = static::whereYear('created_at', $year)->max('id') ?? 0;
        return 'UGS-' . $year . '-' . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
    }
}
