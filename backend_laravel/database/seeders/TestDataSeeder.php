<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Criar Usuário de Teste
        User::updateOrCreate(
            ['email' => 'cliente@teste.com'],
            [
                'name' => 'Cliente Unity Teste',
                'password' => Hash::make('123456'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Criar Categorias
        $categories = [
            ['name' => 'Vestidos',  'slug' => 'vestidos',  'image' => 'https://images.unsplash.com/photo-1595777457583-95e059d581b8'],
            ['name' => 'Blusas',    'slug' => 'blusas',    'image' => 'https://images.unsplash.com/photo-1551163943-3f6a855d1153'],
            ['name' => 'Calças',    'slug' => 'calcas',    'image' => 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246'],
            ['name' => 'Conjuntos', 'slug' => 'conjuntos', 'image' => 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03'],
            ['name' => 'Saias',     'slug' => 'saias',     'image' => 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee'],
            ['name' => 'Acessórios','slug' => 'acessorios','image' => 'https://images.unsplash.com/photo-1535633302704-b029239597dd'],
        ];

        foreach ($categories as $index => $catData) {
            $category = Category::updateOrCreate(
                ['slug' => $catData['slug']],
                [
                    'name' => $catData['name'],
                    'description' => "Coleção exclusiva de {$catData['name']}.",
                    'image_path' => $catData['image'],
                    'display_order' => $index,
                    'is_active' => true,
                ]
            );

            // 3. Criar Produtos para cada categoria
            for ($i = 1; $i <= 4; $i++) {
                $name = "{$catData['name']} Elegant " . Str::random(3);
                $product = Product::create([
                    'category_id' => $category->id,
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'short_description' => "Uma peça versátil e elegante para o seu guarda-roupa.",
                    'description' => "Este produto foi desenhado com foco no conforto e na sofisticação. Ideal para diversas ocasiões, desde eventos casuais até os mais formais.",
                    'price' => rand(89, 299),
                    'sale_price' => rand(0, 1) ? rand(59, 199) : null,
                    'is_featured' => rand(0, 1),
                    'is_new_arrival' => true,
                    'is_active' => true,
                ]);

                // 4. Imagens do Produto
                ProductImage::create([
                    'product_id' => $product->id,
                    'path' => $catData['image'], // Usando a mesma imagem da categoria para teste
                    'is_primary' => true,
                    'display_order' => 0,
                ]);

                // 5. Variantes (Tamanhos)
                foreach (['P', 'M', 'G'] as $size) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => strtoupper(Str::random(10)),
                        'size' => $size,
                        'color' => 'Default',
                        'stock_quantity' => rand(5, 50),
                        'is_active' => true,
                    ]);
                }
            }
        }
    }
}
