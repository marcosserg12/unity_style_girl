<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->string('text_position', 10)->default('left')->after('display_order');
            $table->string('eyebrow_text', 100)->nullable()->after('text_position');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['text_position', 'eyebrow_text']);
        });
    }
};
