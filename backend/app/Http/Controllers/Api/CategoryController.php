<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::active()
            ->root()
            ->with(['children' => fn($q) => $q->active()])
            ->orderBy('display_order')
            ->get();

        return response()->json($categories);
    }
}
