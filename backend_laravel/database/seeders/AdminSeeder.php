<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Banner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Admin padrão
        User::firstOrCreate(
            ['email' => 'admin@unitygirl.com.br'],
            [
                'name'     => 'Administrador Unity Girl',
                'password' => Hash::make('altere-esta-senha'),
                'role'     => 'admin',
                'is_active'=> true,
            ]
        );

        $this->command->info('Admin criado: admin@unitygirl.com.br / altere-esta-senha');

        // Categorias iniciais
        $cats = [
            ['name' => 'Vestidos',   'slug' => 'vestidos',   'order' => 1],
            ['name' => 'Blusas',     'slug' => 'blusas',     'order' => 2],
            ['name' => 'Calças',     'slug' => 'calcas',     'order' => 3],
            ['name' => 'Conjuntos',  'slug' => 'conjuntos',  'order' => 4],
            ['name' => 'Saias',      'slug' => 'saias',      'order' => 5],
            ['name' => 'Acessórios', 'slug' => 'acessorios', 'order' => 6],
        ];

        foreach ($cats as $cat) {
            Category::firstOrCreate(
                ['slug' => $cat['slug']],
                [
                    'name'          => $cat['name'],
                    'display_order' => $cat['order'],
                    'is_active'     => true,
                ]
            );
        }

        $this->command->info('6 categorias criadas.');

        // Banner inicial
        Banner::firstOrCreate(
            ['title' => 'Nova Coleção Unity Girl'],
            [
                'subtitle'      => 'Elegância em cada detalhe',
                'cta_text'      => 'Ver Coleção',
                'cta_link'      => '/produtos',
                'desktop_image' => 'banners/hero-default.jpg',
                'display_order' => 1,
                'is_active'     => true,
            ]
        );

        $this->command->info('Banner padrão criado.');
    }
}
