<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Converte ENUM payment_method para VARCHAR para aceitar qualquer método do Mercado Pago
        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(50) NULL");

        Schema::table('orders', function (Blueprint $table) {
            $table->string('mp_preference_id')->nullable()->after('payment_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('mp_preference_id');
        });

        DB::statement("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('credit_card','debit_card','pix','boleto') NULL");
    }
};
