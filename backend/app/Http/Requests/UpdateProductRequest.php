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
        $productId = $this->route('product')?->id;

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
            'is_featured'       => ['boolean'],
            'is_new_arrival'    => ['boolean'],
            'is_active'         => ['boolean'],
            'meta_title'        => ['nullable', 'string', 'max:255'],
            'meta_description'  => ['nullable', 'string', 'max:500'],
        ];
    }
}
