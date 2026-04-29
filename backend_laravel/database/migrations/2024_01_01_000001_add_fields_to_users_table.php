<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'admin'])->default('customer')->after('email');
            $table->string('phone', 20)->nullable()->after('role');
            $table->string('cpf', 14)->nullable()->unique()->after('phone');
            $table->date('birth_date')->nullable()->after('cpf');
            $table->boolean('is_active')->default(true)->after('birth_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'cpf', 'birth_date', 'is_active']);
        });
    }
};
