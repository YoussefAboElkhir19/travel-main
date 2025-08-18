<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Role;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // عرض كل الإشعارات
    public function index()
    {
       $notifications = Notification::with('role')->get();
        return response()->json(
            [
            'status' => true,
            'data' => $notifications->toArray(),
            'message' => ' Notifications fetched successfully'
        ]

        );
    }

    // عرض كل الرولز (لاستخدامها في الفورم)
    public function getRoles()
    {
        $roles = Role::all();
        return response()->json([
            'message' => 'Notification created successfully',
            'data' => $roles->toArray(),
        ]);
    }

    // إضافة إشعار جديد
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'nullable|string',
            'message' => 'required|string',
            'role_id' => 'nullable|exists:roles,id',
            'sendTo' => 'required|string',
            'deliveryMethod' => 'required|string',
        ]);

        $notification = new Notification();
        $notification->title = $data['title'];
        $notification->message = $data['message'];
        $notification->role_id = $data['role_id'];
        $notification->sendTo = $data['sendTo'];
        $notification->deliveryMethod = $data['deliveryMethod'];
        $notification->save();

        return response()->json([
            'message' => 'Notification created successfully',
            'notification' => $notification->toArray(),
        ], 201);
    }
}
