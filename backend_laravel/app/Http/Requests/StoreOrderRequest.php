<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'payment_method'              => ['required', 'in:credit_card,debit_card,pix,boleto'],
            'address_id'                  => ['required_without:shipping_address', 'exists:addresses,id'],
            'shipping_address'            => ['required_without:address_id', 'array'],
            'shipping_address.zip_code'   => ['required_with:shipping_address', 'string'],
            'shipping_address.street'     => ['required_with:shipping_address', 'string'],
            'shipping_address.number'     => ['required_with:shipping_address', 'string'],
            'shipping_address.neighborhood' => ['required_with:shipping_address', 'string'],
            'shipping_address.city'       => ['required_with:shipping_address', 'string'],
            'shipping_address.state'      => ['required_with:shipping_address', 'string', 'size:2'],
            'coupon_code'                 => ['nullable', 'string', 'max:50'],
        ];
    }
}
