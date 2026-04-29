<?php

return [
    'access_token' => env('MP_ACCESS_TOKEN', ''),
    'public_key'   => env('MP_PUBLIC_KEY', ''),
    'sandbox'      => env('MP_SANDBOX', true),
    'webhook_secret' => env('MP_WEBHOOK_SECRET', ''),
    'currency'     => 'BRL',
    'statement_descriptor' => 'UNITY GIRL STYLE',
    'installments' => (int) env('MP_MAX_INSTALLMENTS', 6),
];
