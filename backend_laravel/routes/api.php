<?php

use App\Http\Controllers\Api\Admin\AdminBannerController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminColorController;
use App\Http\Controllers\Api\Admin\AdminCouponController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminSettingController;
use App\Http\Controllers\Api\Admin\AdminSizeController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Unity Girl Style — API Routes
|--------------------------------------------------------------------------
|
| Versão: v1
| Base URL: /api/v1
|
*/

Route::prefix('v1')->group(function () {

    // ─── Rotas Públicas ───────────────────────────────────────────────────────

    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])
             ->middleware('throttle:5,1');

        Route::post('/login', [AuthController::class, 'login'])
             ->middleware('throttle:10,1');
    });

    Route::get('/banners',    [BannerController::class,   'index']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/settings',   [SettingController::class,  'index']);

    Route::prefix('products')->group(function () {
        Route::get('/',       [ProductController::class, 'index']);
        Route::get('/{slug}', [ProductController::class, 'show']);
    });

    // ─── Webhook público do Mercado Pago ─────────────────────────────────────
    Route::post('/webhooks/mercadopago', [WebhookController::class, 'mercadopago']);

    // ─── Rotas Autenticadas (Clientes) ────────────────────────────────────────

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout',           [AuthController::class, 'logout']);
        Route::get('/auth/me',                [AuthController::class, 'me']);
        Route::post('/auth/change-password',  [AuthController::class, 'changePassword']);

        // Checkout via WhatsApp (ativo)
        Route::post('/checkout/whatsapp', [CheckoutController::class, 'createWhatsAppOrder']);

        // Cupons
        Route::post('/coupons/validate', [CouponController::class, 'validate']);

        // Checkout com Mercado Pago (comentado — aguardando CNPJ)
        // Route::post('/checkout/preference', [CheckoutController::class, 'createPreference']);
        // Route::post('/checkout/pay',        [CheckoutController::class, 'pay']);

        // Endereços do cliente
        Route::prefix('addresses')->group(function () {
            Route::get('/',                        [AddressController::class, 'index']);
            Route::post('/',                       [AddressController::class, 'store']);
            Route::patch('/{address}/default',     [AddressController::class, 'setDefault']);
            Route::delete('/{address}',            [AddressController::class, 'destroy']);
        });

        // Pedidos do cliente autenticado
        Route::prefix('orders')->group(function () {
            Route::get('/',        [OrderController::class, 'index']);
            Route::post('/',       [OrderController::class, 'store']);
            Route::get('/{order}', [OrderController::class, 'show']);
        });
    });

    // Carrinho — anônimo e autenticado
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/cart',                 [CartController::class, 'index']);
        Route::post('/cart/items',          [CartController::class, 'add']);
        Route::patch('/cart/items/{item}',  [CartController::class, 'update']);
        Route::delete('/cart/items/{item}', [CartController::class, 'remove']);
        Route::delete('/cart',              [CartController::class, 'clear']);
    });

    // ─── Rotas do Painel Administrativo ──────────────────────────────────────

    Route::prefix('admin')
         ->middleware(['auth:sanctum', 'admin'])
         ->group(function () {

        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Gestão de produtos
        Route::prefix('products')->group(function () {
            Route::get('/',                           [AdminProductController::class, 'index']);
            Route::post('/',                          [AdminProductController::class, 'store']);
            Route::get('/{product}',                  [AdminProductController::class, 'show']);
            Route::put('/{product}',                  [AdminProductController::class, 'update']);
            Route::delete('/{product}',               [AdminProductController::class, 'destroy']);
            Route::post('/{id}/restore',              [AdminProductController::class, 'restore']);
            Route::patch('/{product}/flag',           [AdminProductController::class, 'updateFlag']);
            Route::patch('/variants/{variant}/stock', [AdminProductController::class, 'updateVariantStock']);
        });

        // Gestão de pedidos
        Route::prefix('orders')->group(function () {
            Route::get('/',               [AdminOrderController::class, 'index']);
            Route::get('/{order}',        [AdminOrderController::class, 'show']);
            Route::patch('/{order}/status', [AdminOrderController::class, 'updateStatus']);
        });

        // Slideshow (banners)
        Route::get('/banners',          [AdminBannerController::class, 'index']);
        Route::post('/banners',         [AdminBannerController::class, 'store']);
        Route::post('/banners/{banner}', [AdminBannerController::class, 'update']); // POST + _method=PUT
        Route::delete('/banners/{banner}', [AdminBannerController::class, 'destroy']);

        // Categorias
        Route::get('/categories',             [AdminCategoryController::class, 'index']);
        Route::post('/categories',            [AdminCategoryController::class, 'store']);
        Route::post('/categories/{category}', [AdminCategoryController::class, 'update']); // POST + _method=PUT
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        // Tamanhos
        Route::get('/sizes',          [AdminSizeController::class, 'index']);
        Route::post('/sizes',         [AdminSizeController::class, 'store']);
        Route::put('/sizes/{size}',   [AdminSizeController::class, 'update']);
        Route::delete('/sizes/{size}', [AdminSizeController::class, 'destroy']);

        // Cores
        Route::get('/colors',           [AdminColorController::class, 'index']);
        Route::post('/colors',          [AdminColorController::class, 'store']);
        Route::put('/colors/{color}',   [AdminColorController::class, 'update']);
        Route::delete('/colors/{color}', [AdminColorController::class, 'destroy']);

        // Configurações do site (menu, etc.)
        Route::get('/settings',  [AdminSettingController::class, 'index']);
        Route::post('/settings', [AdminSettingController::class, 'update']);

        // Gestão de Usuários (Clientes)
        Route::prefix('users')->group(function () {
            Route::get('/',                 [AdminUserController::class, 'index']);
            Route::get('/{user}',           [AdminUserController::class, 'show']);
            Route::patch('/{user}/toggle-active', [AdminUserController::class, 'toggleActive']);
        });

        // Cupons
        Route::prefix('coupons')->group(function () {
            Route::get('/',                     [AdminCouponController::class, 'index']);
            Route::post('/',                    [AdminCouponController::class, 'store']);
            Route::patch('/{coupon}/toggle',    [AdminCouponController::class, 'toggle']);
            Route::delete('/{coupon}',          [AdminCouponController::class, 'destroy']);
        });
    });
});
