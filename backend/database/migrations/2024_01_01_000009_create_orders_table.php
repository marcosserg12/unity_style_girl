<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number')->unique(); // UGS-2024-00001
            $table->enum('status', [
                'pending',      // aguardando pagamento
                'paid',         // pagamento confirmado
                'processing',   // em separação
                'shipped',      // enviado
                'delivered',    // entregue
                'cancelled',    // cancelado
                'refunded',     // reembolsado
            ])->default('pending');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_cost', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->string('coupon_code')->nullable();
            $table->decimal('total', 10, 2);
            $table->enum('payment_method', ['credit_card', 'debit_card', 'pix', 'boleto'])->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->string('payment_transaction_id')->nullable();
            $table->json('shipping_address'); // snapshot do endereço no momento da compra
            $table->string('tracking_code')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('order_number');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
