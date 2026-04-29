<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->decimal('cost_price', 10, 2)->nullable(); // interno, não exposto na API pública
            $table->decimal('weight', 8, 3)->nullable(); // kg, para cálculo de frete
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new_arrival')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'is_featured']);
            $table->index(['category_id', 'is_active']);
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
