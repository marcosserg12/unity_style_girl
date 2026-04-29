<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $productId = $this->route('product');
        if ($productId instanceof \App\Models\Product) {
            $productId = $productId->id;
        }

        return [
            'category_id'       => ['sometimes', 'exists:categories,id'],
            'name'              => ['sometimes', 'string', 'max:255'],
            'slug'              => ['sometimes', 'string', 'max:255', "unique:products,slug,{$productId}", 'regex:/^[a-z0-9\-]+$/'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description'       => ['nullable', 'string'],
            'price'             => ['sometimes', 'numeric', 'min:0.01'],
            'sale_price'        => ['nullable', 'numeric', 'min:0.01', 'lt:price'],
            'cost_price'        => ['nullable', 'numeric', 'min:0'],
            'weight'            => ['nullable', 'numeric', 'min:0'],
            'is_featured'       => ['sometimes'],
            'is_new_arrival'    => ['sometimes'],
            'is_active'         => ['sometimes'],
            'meta_description'  => ['nullable', 'string', 'max:500'],
            
            // Variants
            'variants'                   => ['sometimes', 'array'],
            'variants.*.id'              => ['nullable'],
            'variants.*.size'            => ['required_with:variants', 'string'],
            'variants.*.color'           => ['nullable', 'string'],
            'variants.*.color_hex'       => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'variants.*.stock_quantity'  => ['required_with:variants', 'integer', 'min:0'],
            
            // Images
            'new_images'               => ['nullable', 'array'],
            'new_images.*'             => ['file', 'max:10240'], // 10MB max, more permissive type check
            'primary_image_index'      => ['nullable'],
            'new_image_colors'         => ['nullable', 'array'],
            'delete_image_ids'         => ['nullable', 'array'],
            'primary_image_id'         => ['nullable'],
        ];
    }

    protected function prepareForValidation()
    {
        // Convert "null" strings or empty strings from FormData to actual null
        if ($this->has('sale_price') && ($this->sale_price === '' || $this->sale_price === 'null' || $this->sale_price === 'undefined')) {
            $this->merge(['sale_price' => null]);
        }

        // Convert boolean strings to actual booleans
        $this->merge([
            'is_featured'    => filter_var($this->is_featured,    FILTER_VALIDATE_BOOLEAN),
            'is_new_arrival' => filter_var($this->is_new_arrival, FILTER_VALIDATE_BOOLEAN),
            'is_active'      => filter_var($this->is_active,      FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
