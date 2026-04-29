<?php

namespace Database\Seeders;

use App\Models\AppColor;
use App\Models\AppSize;
use Illuminate\Database\Seeder;

class AppColorSizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $colors = [
            ['name' => 'Preto',    'hex' => '#1a1a1a'],
            ['name' => 'Branco',   'hex' => '#f5f5f0'],
            ['name' => 'Bege',     'hex' => '#d4b896'],
            ['name' => 'Vinho',    'hex' => '#7B0D1E'],
            ['name' => 'Marsala',  'hex' => '#964F4C'],
            ['name' => 'Rosa',     'hex' => '#e8a5b4'],
            ['name' => 'Azul',     'hex' => '#5b7fa6'],
            ['name' => 'Marinho',  'hex' => '#1a2f4a'],
            ['name' => 'Verde',    'hex' => '#4a7c59'],
            ['name' => 'Vermelho', 'hex' => '#c0392b'],
            ['name' => 'Cinza',    'hex' => '#8e8e8e'],
            ['name' => 'Caramelo', 'hex' => '#c68642'],
            ['name' => 'Lilás',    'hex' => '#b39ddb'],
            ['name' => 'Único',    'hex' => '#d4b896'],
        ];

        foreach ($colors as $index => $color) {
            AppColor::updateOrCreate(
                ['name' => $color['name']],
                ['hex' => $color['hex'], 'display_order' => $index]
            );
        }

        $sizes = ['PP', 'P', 'M', 'G', 'GG', 'Único'];

        foreach ($sizes as $index => $size) {
            AppSize::updateOrCreate(
                ['name' => $size],
                ['display_order' => $index]
            );
        }
    }
}
