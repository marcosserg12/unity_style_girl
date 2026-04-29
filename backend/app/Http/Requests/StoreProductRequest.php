<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'category_id'       => ['required', 'exists:categories,id'],
            'name'              => ['required', 'string', 'max:255'],
            'slug'              => ['required', 'string', 'max:255', 'unique:products,slug', 'regex:/^[a-z0-9\-]+$/'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description'       => ['nullable', 'string'],
            'price'             => ['required', 'numeric', 'min:0.01', 'max:99999.99'],
            'sale_price'        => ['nullable', 'numeric', 'min:0.01', 'max:99999.99', 'lt:price'],
            'cost_price'        => ['nullable', 'numeric', 'min:0'],
            'weight'            => ['nullable', 'numeric', 'min:0'],
            'is_featured'       => ['boolean'],
            'is_new_arrival'    => ['boolean'],
            'is_active'         => ['boolean'],
            'meta_title'        => ['nullable', 'string', 'max:255'],
            'meta_description'  => ['nullable', 'string', 'max:500'],

            // Variações são obrigatórias — todo produto precisa de ao menos uma
            'variants'                    => ['required', 'array', 'min:1'],
            'variants.*.sku'              => ['required', 'string', 'max:100', 'distinct', 'unique:product_variants,sku'],
            'variants.*.size'             => ['nullable', 'string', 'max:10', 'in:PP,P,M,G,GG,U,XG,XGG,34,36,38,40,42,44,46,48,50'],
            'variants.*.color'            => ['nullable', 'string', 'max:50'],
            'variants.*.color_hex'        => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'variants.*.stock_quantity'   => ['required', 'integer', 'min:0'],
            'variants.*.min_stock_alert'  => ['integer', 'min:0'],
            'variants.*.price_modifier'   => ['numeric'],

            // Imagens
            'images'               => ['nullable', 'array'],
            'images.*'             => ['image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // 5MB
            'primary_image_index'  => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required'    => 'Selecione uma categoria.',
            'category_id.exists'      => 'Categoria inválida.',
            'name.required'           => 'O nome do produto é obrigatório.',
            'price.required'          => 'O preço do produto é obrigatório.',
            'price.min'               => 'O preço deve ser maior que zero.',
            'sale_price.lt'           => 'O preço promocional deve ser menor que o preço original.',
            'variants.required'       => 'Adicione pelo menos uma variação ao produto.',
            'variants.*.sku.required' => 'Cada variação precisa de um SKU.',
            'variants.*.sku.unique'   => 'O SKU :input já está em uso.',
            'variants.*.sku.distinct' => 'Existem SKUs duplicados na lista de variações.',
        ];
    }
}
