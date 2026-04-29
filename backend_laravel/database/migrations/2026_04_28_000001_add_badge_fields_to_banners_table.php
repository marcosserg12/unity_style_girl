<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->boolean('show_badge')->default(false)->after('is_active');
            $table->string('badge_label')->nullable()->after('show_badge');
            $table->string('badge_text')->nullable()->after('badge_label');
            $table->string('badge_subtext')->nullable()->after('badge_text');
            $table->string('disclaimer', 400)->nullable()->after('badge_subtext');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['show_badge', 'badge_label', 'badge_text', 'badge_subtext', 'disclaimer']);
        });
    }
};
