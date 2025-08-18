<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => true,
            'data' => $roles->toArray(),
            'message' => 'Roles fetched successfully'
        ]);
    }

    public function store(Request $request)
    {
        $validation = Validator::make($request->all(), [
            'name' => 'required|max:255|unique:roles',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array',
            'is_system' => 'nullable|boolean',
            'can_add_items' => 'nullable|boolean',
            'default_route' => 'nullable|string'
        ]);

        if ($validation->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validation->errors()
            ], 422);
        }

        $role = new Role();
        $role->name = $request->name;
        $role->description = $request->description;
        $role->permissions = is_array($request->permissions)
            ? $request->permissions
            : json_decode($request->permissions, true);
        $role->is_system = $request->is_system ?? false;
        $role->can_add_items = $request->can_add_items ?? false;
        $role->default_route = $request->default_route ?? '/';
        $role->save();

        return response()->json([
            'status' => true,
            'data' => [$role->toArray()],
            'message' => 'Role created successfully'
        ], 201);
    }
    public function update(Request $request, $id)
{
    try {
        $role = Role::findOrFail($id);
        // to make permissions an array
           $permissions = $request->input('permissions');
        if (!is_array($permissions)) {
            $permissions = $permissions ? [$permissions] : [];
        }

        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'permissions' => 'nullable|array', // مهم هنا إنها Array
            'permissions.*' => 'string', // كل عنصر في الـ Array يكون نص
            'is_system' => 'boolean',
            'can_add_items' => 'boolean',
            'default_route' => 'nullable|string',
        ]);

        // تحديث البيانات
        $role->name = $validated['name'];
        $role->description = $validated['description'] ?? null;
        $role->permissions = $validated['permissions'] ?? [];
        $role->is_system = $validated['is_system'] ?? false;
        $role->can_add_items = $validated['can_add_items'] ?? false;
        $role->default_route = $validated['default_route'] ?? '/attendance';
        $role->save();

        // رجع Array عشان React يتعامل معاه
        return response()->json([
            'status' => true,
            'data' => [$role->fresh()], // خليها Array حتى لو عنصر واحد
            'message' => 'Role updated successfully'
        ], 200);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'status' => false,
            'errors' => $e->errors(),
            'message' => 'Validation failed'
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'status' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}


    public function destroy($id)
    {
        $role = Role::find($id);
        if (!$role) {
            return response()->json([
                'status' => false,
                'message' => 'Role not found'
            ], 404);
        }

        $role->delete();

        return response()->json([
            'status' => true,
            'data' => [],
            'message' => 'Role deleted successfully'
        ]);
    }
}
