<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Category::withCount('products')->orderBy('display_order')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'          => ['required', 'string', 'max:100'],
            'slug'          => ['nullable', 'string', 'max:100'],
            'description'   => ['nullable', 'string'],
            'image'         => ['nullable', 'image', 'max:2048'],
            'display_order' => ['nullable', 'integer'],
            'is_active'     => ['nullable'],
            'parent_id'     => ['nullable', 'exists:categories,id'],
        ]);

        $data = $request->only('name', 'description', 'display_order', 'parent_id');
        $data['slug']      = $request->input('slug') ?: Str::slug($request->input('name'));
        $data['is_active'] = filter_var($request->input('is_active', true), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        return response()->json(Category::create($data), 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $request->validate([
            'name'          => ['required', 'string', 'max:100'],
            'slug'          => ['nullable', 'string', 'max:100'],
            'description'   => ['nullable', 'string'],
            'image'         => ['nullable', 'image', 'max:2048'],
            'display_order' => ['nullable', 'integer'],
            'is_active'     => ['nullable'],
            'parent_id'     => ['nullable', 'exists:categories,id'],
        ]);

        $data = $request->only('name', 'description', 'display_order', 'parent_id');
        if ($request->filled('slug')) {
            $data['slug'] = $request->input('slug');
        }
        $data['is_active'] = filter_var($request->input('is_active', $category->is_active), FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            if ($category->image_path) Storage::disk('public')->delete($category->image_path);
            $data['image_path'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);
        return response()->json($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->image_path) Storage::disk('public')->delete($category->image_path);
        $category->delete();
        return response()->json(['message' => 'Categoria removida.']);
    }
}
