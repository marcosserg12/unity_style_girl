<?php

use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
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
             ->middleware('throttle:5,1'); // 5 tentativas por minuto

        Route::post('/login', [AuthController::class, 'login'])
             ->middleware('throttle:10,1');
    });

    Route::get('/banners',    [BannerController::class,   'index']);
    Route::get('/categories', [CategoryController::class, 'index']);

    Route::prefix('products')->group(function () {
        Route::get('/',        [ProductController::class, 'index']);
        Route::get('/{slug}',  [ProductController::class, 'show']);
    });

    // ─── Rotas Autenticadas (Clientes) ────────────────────────────────────────

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me',      [AuthController::class, 'me']);

        // Carrinho
        Route::prefix('cart')->group(function () {
            Route::get('/',               [CartController::class, 'index']);
            Route::post('/items',         [CartController::class, 'add']);
            Route::patch('/items/{item}', [CartController::class, 'update']);
            Route::delete('/items/{item}',[CartController::class, 'remove']);
            Route::delete('/',            [CartController::class, 'clear']);
        });

        // Pedidos do cliente autenticado
        Route::prefix('orders')->group(function () {
            Route::get('/',        [OrderController::class, 'index']);
            Route::post('/',       [OrderController::class, 'store']);
            Route::get('/{order}', [OrderController::class, 'show']);
        });
    });

    // Carrinho anônimo (visitantes sem login)
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/cart',                [CartController::class, 'index']);
        Route::post('/cart/items',         [CartController::class, 'add']);
        Route::patch('/cart/items/{item}', [CartController::class, 'update']);
        Route::delete('/cart/items/{item}',[CartController::class, 'remove']);
        Route::delete('/cart',             [CartController::class, 'clear']);
    });

    // ─── Rotas do Painel Administrativo ──────────────────────────────────────

    Route::prefix('admin')
         ->middleware(['auth:sanctum', 'admin'])
         ->group(function () {

        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Gestão de produtos
        Route::prefix('products')->group(function () {
            Route::get('/',                          [AdminProductController::class, 'index']);
            Route::post('/',                         [AdminProductController::class, 'store']);
            Route::get('/{product}',                 [AdminProductController::class, 'show']);
            Route::put('/{product}',                 [AdminProductController::class, 'update']);
            Route::delete('/{product}',              [AdminProductController::class, 'destroy']);
            Route::post('/{id}/restore',             [AdminProductController::class, 'restore']);
            Route::patch('/variants/{variant}/stock', [AdminProductController::class, 'updateVariantStock']);
        });

        // Gestão de pedidos
        Route::prefix('orders')->group(function () {
            Route::get('/',                          [AdminOrderController::class, 'index']);
            Route::get('/{order}',                   [AdminOrderController::class, 'show']);
            Route::patch('/{order}/status',          [AdminOrderController::class, 'updateStatus']);
        });
    });
});
