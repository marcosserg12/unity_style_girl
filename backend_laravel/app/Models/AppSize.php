<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSize extends Model
{
    protected $table = 'app_sizes';

    protected $fillable = ['name', 'display_order'];
}
