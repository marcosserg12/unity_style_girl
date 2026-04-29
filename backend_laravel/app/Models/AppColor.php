<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppColor extends Model
{
    protected $table = 'app_colors';

    protected $fillable = ['name', 'hex', 'display_order'];
}
