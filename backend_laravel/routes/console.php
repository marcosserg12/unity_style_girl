<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cancela pedidos pendentes há mais de 4 dias e restaura estoque — roda todo dia às 03:00
Schedule::command('orders:cancel-overdue')->dailyAt('03:00');
