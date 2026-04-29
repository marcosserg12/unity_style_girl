<?php

use App\Http\Middleware\AdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => AdminMiddleware::class,
        ]);

        // CORS é gerenciado pelo config/cors.php + HandleCors (global)
        // NÃO usar statefulApi() — o app usa Bearer token, não cookie/sessão
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Retorna JSON para erros de autenticação e autorização
        $exceptions->shouldRenderJsonWhen(fn ($request) => $request->is('api/*'));
    })->create();
