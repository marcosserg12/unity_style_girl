<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $cats = Category::pluck('id', 'slug');

        // Mapeamento categoria -> imagem de placeholder
        $catImages = [
            'vestidos'  => '/images/prod-01.svg',
            'blusas'    => '/images/prod-02.svg',
            'calcas'    => '/images/prod-03.svg',
            'saias'     => '/images/prod-04.svg',
            'conjuntos' => '/images/prod-05.svg',
            'acessorios'=> '/images/prod-06.svg',
        ];

        $products = [
            // ── VESTIDOS ────────────────────────────────────────────────────
            ['cat' => 'vestidos',   'name' => 'Vestido Midi Floral Elegance',     'price' => 299.90, 'sale' => 239.90, 'featured' => true,  'new' => false, 'desc' => 'Vestido midi com estampa floral exclusiva e decote em V. Perfeito para eventos sociais.'],
            ['cat' => 'vestidos',   'name' => 'Vestido Longo Noite Especial',      'price' => 489.90, 'sale' => null,   'featured' => true,  'new' => true,  'desc' => 'Vestido longo em tecido nobre para ocasiões especiais. Decote costas aberto.'],
            ['cat' => 'vestidos',   'name' => 'Vestido Tubinho Clássico',          'price' => 259.90, 'sale' => 219.90,'featured' => false, 'new' => false, 'desc' => 'Tubinho clássico em crepe, corte justo que valoriza a silhueta.'],
            ['cat' => 'vestidos',   'name' => 'Vestido Wrap Romântico',            'price' => 219.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Modelo envelope com laço na lateral e babados sutis. Floral delicado.'],
            ['cat' => 'vestidos',   'name' => 'Vestido Estampado Primavera',       'price' => 189.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Tecido leve com estampa primaveral. Ideal para looks do dia a dia.'],

            // ── BLUSAS ───────────────────────────────────────────────────────
            ['cat' => 'blusas',     'name' => 'Blusa Decote V em Crepe',           'price' => 149.90, 'sale' => null,   'featured' => true,  'new' => false, 'desc' => 'Blusa clássica com decote V e caimento fluido. Versátil para qualquer look.'],
            ['cat' => 'blusas',     'name' => 'Blusa Bordada Floral',              'price' => 179.90, 'sale' => 139.90,'featured' => true,  'new' => false, 'desc' => 'Bordados florais artesanais em voil delicado. Exclusividade e sofisticação.'],
            ['cat' => 'blusas',     'name' => 'Blusa Manga Bufante',               'price' => 139.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Tendência da estação com mangas bufantes volumosas. Tecido leve e confortável.'],
            ['cat' => 'blusas',     'name' => 'Blusa Cropped Elegante',            'price' => 109.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Cropped de alfaiataria com acabamento impecável. Combina com saias e calças.'],
            ['cat' => 'blusas',     'name' => 'Blusa com Laço Toque Suave',        'price' => 159.90, 'sale' => null,   'featured' => false, 'new' => false, 'desc' => 'Acabamento com laço frontal em seda. Feminina e delicada.'],

            // ── CALÇAS ───────────────────────────────────────────────────────
            ['cat' => 'calcas',     'name' => 'Calça Alfaiataria Premium',         'price' => 299.90, 'sale' => 249.90,'featured' => true,  'new' => false, 'desc' => 'Alfaiataria estruturada com corte reto. Elegância para o trabalho e eventos.'],
            ['cat' => 'calcas',     'name' => 'Calça Wide Leg Clássica',           'price' => 269.90, 'sale' => null,   'featured' => true,  'new' => true,  'desc' => 'Wide leg de cintura alta em tecido premium. Corte amplo e fluido.'],
            ['cat' => 'calcas',     'name' => 'Calça Pantacourt em Linho',         'price' => 249.90, 'sale' => null,   'featured' => false, 'new' => false, 'desc' => 'Pantacourt em linho natural, ideal para o calor. Confortável e estilosa.'],
            ['cat' => 'calcas',     'name' => 'Calça Cigarrete Elegante',          'price' => 229.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Cigarrete ajustada com zíper lateral. Corte que valoriza as pernas.'],
            ['cat' => 'calcas',     'name' => 'Calça Palazzo Estampada',           'price' => 259.90, 'sale' => 209.90,'featured' => false, 'new' => false, 'desc' => 'Palazzo fluida com estampa exclusiva. Movimento e elegância em cada passo.'],

            // ── CONJUNTOS ────────────────────────────────────────────────────
            ['cat' => 'conjuntos',  'name' => 'Conjunto Blusê e Calça',            'price' => 399.90, 'sale' => 329.90,'featured' => true,  'new' => false, 'desc' => 'Conjunto combinado em tecido premium. Blusê manga longa + calça pantalona.'],
            ['cat' => 'conjuntos',  'name' => 'Conjunto Cropped e Saia Midi',      'price' => 349.90, 'sale' => null,   'featured' => true,  'new' => true,  'desc' => 'Cropped estruturado + saia midi plissada. Conjunto sofisticado e moderno.'],
            ['cat' => 'conjuntos',  'name' => 'Conjunto Alfaiataria Duo',          'price' => 459.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Blazer curto + calça wide leg em alfaiataria. Elegância total do escritório ao jantar.'],
            ['cat' => 'conjuntos',  'name' => 'Conjunto Linho Delicado',           'price' => 329.90, 'sale' => null,   'featured' => false, 'new' => false, 'desc' => 'Conjunto em linho natural com detalhes artesanais. Ideal para o verão.'],
            ['cat' => 'conjuntos',  'name' => 'Conjunto Festa Glam',               'price' => 519.90, 'sale' => 419.90,'featured' => false, 'new' => true,  'desc' => 'Top decotado + calça ampla em tecido brilhante. Para arrasar nas festas.'],

            // ── SAIAS ────────────────────────────────────────────────────────
            ['cat' => 'saias',      'name' => 'Saia Midi Floral',                  'price' => 189.90, 'sale' => null,   'featured' => true,  'new' => false, 'desc' => 'Saia midi com estampa floral em tecido leve. Feminina e versátil.'],
            ['cat' => 'saias',      'name' => 'Saia Plissada Clássica',            'price' => 169.90, 'sale' => 139.90,'featured' => true,  'new' => false, 'desc' => 'Plissada de cintura alta, movimento suave a cada passo. Elegância atemporal.'],
            ['cat' => 'saias',      'name' => 'Saia Lápis Elegante',               'price' => 149.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Lápis ajustada em couro ecológico. Sofisticação urbana.'],
            ['cat' => 'saias',      'name' => 'Saia Evasê Casual',                 'price' => 139.90, 'sale' => null,   'featured' => false, 'new' => false, 'desc' => 'Evasê rodada com cintura marcada. Confortável para o dia a dia.'],
            ['cat' => 'saias',      'name' => 'Saia Longa Boho Chic',              'price' => 209.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Longa fluida com fenda lateral e estampa exclusiva. Estilo boho chic.'],

            // ── ACESSÓRIOS ───────────────────────────────────────────────────
            ['cat' => 'acessorios', 'name' => 'Bolsa Estruturada em Couro',        'price' => 399.90, 'sale' => 319.90,'featured' => true,  'new' => false, 'desc' => 'Bolsa estruturada em couro legítimo com fecho dourado. Sofisticação para qualquer look.'],
            ['cat' => 'acessorios', 'name' => 'Cinto Dourado Delicado',            'price' => 89.90,  'sale' => null,   'featured' => true,  'new' => true,  'desc' => 'Cinto fino com fivela dourada. Perfeito para marcar a cintura.'],
            ['cat' => 'acessorios', 'name' => 'Lenço Seda Estampado',              'price' => 129.90, 'sale' => null,   'featured' => false, 'new' => false, 'desc' => 'Lenço de seda pura com estampa floral exclusiva. Mil formas de usar.'],
            ['cat' => 'acessorios', 'name' => 'Colar de Pérolas Elegante',         'price' => 159.90, 'sale' => null,   'featured' => false, 'new' => true,  'desc' => 'Colar de pérolas sintéticas com fecho dourado. Clássico e atemporal.'],
            ['cat' => 'acessorios', 'name' => 'Brincos Cristal em Gota',           'price' => 99.90,  'sale' => null,   'featured' => false, 'new' => false, 'desc' => 'Brincos longos em formato gota com cristais Swarovski. Brilho e elegância.'],
        ];

        $clothingSizes    = ['PP', 'P', 'M', 'G', 'GG'];
        $accessorySizes   = ['Única'];
        $accessoryCats    = ['acessorios'];

        foreach ($products as $idx => $data) {
            $catId = $cats[$data['cat']] ?? null;
            if (!$catId) continue;

            $salePrice = $data['sale'];
            $discount  = $salePrice ? round((1 - $salePrice / $data['price']) * 100) : null;

            $product = Product::firstOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'category_id'         => $catId,
                    'name'                => $data['name'],
                    'short_description'   => $data['desc'],
                    'description'         => $data['desc'] . ' Desenvolvida com materiais de alta qualidade e acabamento premium, esta peça é a escolha certa para mulheres que valorizam estilo e elegância.',
                    'price'               => $data['price'],
                    'sale_price'          => $salePrice,
                    'is_featured'         => $data['featured'],
                    'is_new_arrival'      => $data['new'],
                    'is_active'           => true,
                    'weight'              => rand(200, 800),
                    'meta_title'          => $data['name'] . ' | Unity Girl Style',
                    'meta_description'    => $data['desc'],
                ]
            );

            // Imagem placeholder
            if ($product->wasRecentlyCreated) {
                ProductImage::create([
                    'product_id'    => $product->id,
                    'path'          => $catImages[$data['cat']],
                    'alt_text'      => $data['name'],
                    'display_order' => 0,
                    'is_primary'    => true,
                ]);

                // Variantes
                $sizes = in_array($data['cat'], $accessoryCats) ? $accessorySizes : $clothingSizes;
                foreach ($sizes as $order => $size) {
                    ProductVariant::create([
                        'product_id'      => $product->id,
                        'sku'             => strtoupper(Str::slug($data['name'])) . '-' . $size,
                        'size'            => $size,
                        'color'           => null,
                        'color_hex'       => null,
                        'stock_quantity'  => rand(5, 40),
                        'min_stock_alert' => 3,
                        'price_modifier'  => 0,
                        'is_active'       => true,
                    ]);
                }
            }
        }

        $this->command->info('30 produtos de teste criados com variantes e imagens!');
    }
}
