
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\ToDoController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\ShiftController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
// ToDo Routes
Route::get('/todos', [ToDoController::class , 'index' ]);
Route::post('/todos', [ToDoController::class , 'store' ]);
Route::delete('/todos/{id}', [ToDoController::class , 'destroy' ]);
Route::put('/todos/{id}', [ToDoController::class , 'update' ]);
// Users Routes
// Route::get('/users', [UserController::class , 'index' ]);
// Route::post('/users', [UserController::class , 'store' ]);
// Route::delete('/users/{id}', [UserController::class , 'destroy' ]);

// Users And Role 
Route::apiResource('users', UserController::class);
Route::apiResource('roles', RoleController::class);

// Leave Request 
Route::get('leave-requests', [LeaveRequestController::class, 'index']);
Route::post('leave-requests', [LeaveRequestController::class, 'store']);
Route::put('/leave-requests/{id}', [LeaveRequestController::class, 'update']);
Route::delete('/leave-requests/{id}', [LeaveRequestController::class, 'destroy']);
// Shift 
Route::get('shifts', [ShiftController::class, 'index']);
Route::post('shifts', [ShiftController::class, 'store']);
Route::delete('/shifts/{id}', [ShiftController::class, 'destroy']);
