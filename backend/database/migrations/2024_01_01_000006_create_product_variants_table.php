<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('sku')->unique();
            // Tamanhos brasileiros: PP, P, M, G, GG, U (Único) + numéricos como 36, 38, 40...
            $table->string('size', 10)->nullable();
            $table->string('color')->nullable();
            $table->string('color_hex', 7)->nullable(); // #RRGGBB para exibição no frontend
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->unsignedInteger('min_stock_alert')->default(5); // alerta de estoque baixo
            // Modificador de preço: +10.00 ou -5.00 em relação ao preço base do produto
            $table->decimal('price_modifier', 8, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['product_id', 'is_active']);
            $table->index(['product_id', 'size', 'color']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
