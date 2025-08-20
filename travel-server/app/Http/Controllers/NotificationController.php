<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Read_Notification;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Get notifications for current user
    public function getUserNotifications()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get notifications based on sendTo field and user's role
        $notifications = Notification::with('role')
            ->where(function ($query) use ($user) {
                $query->where('sendTo', 'all') // Global notifications
                    ->orWhere(function ($subQuery) use ($user) {
                        $subQuery->where('sendTo', 'role')
                            ->where('role_id', $user->role_id);
                    });
                // Note: Removed user-specific logic since your schema doesn't have user_id field
                // If you need user-specific notifications, you'd need to add a user_id field to notifications table
            })
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        // Get read notification IDs for THIS SPECIFIC USER ONLY
        $readNotificationIds = Read_Notification::where('user_id', $user->id)
            ->pluck('notification_id')
            ->toArray();

        // Mark notifications as read/unread ONLY FOR THIS USER and add text field for React compatibility
        $enhancedNotifications = $notifications->map(function ($notification) use ($readNotificationIds) {
            // FIXED: Check if THIS SPECIFIC USER has read this notification
            $notification->is_read = in_array($notification->id, $readNotificationIds);
            $notification->text = $notification->message; // Add text field for React compatibility
            return $notification;
        });

        return response()->json([
            'status' => true,
            'data' => $enhancedNotifications,
            'message' => 'User notifications fetched successfully'
        ]);
    }

    // عرض كل الإشعارات (للأدمن)
    public function index()
    {
        $notifications = Notification::with('role')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                $notification->text = $notification->message; // Add text field for React compatibility
                // NOTE: For admin view, we don't set is_read as it's user-specific
                return $notification;
            });

        return response()->json([
            'status' => true,
            'data' => $notifications->toArray(),
            'message' => 'Notifications fetched successfully'
        ]);
    }

    // عرض كل الرولز (لاستخدامها في الفورم)
    public function getRoles()
    {
        $roles = Role::all();
        return response()->json([
            'status' => true,
            'data' => $roles->toArray(),
            'message' => 'Roles fetched successfully'
        ]);
    }

    // إضافة إشعار جديد
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'nullable|string',
            'message' => 'required|string',
            'role_id' => 'nullable|exists:roles,id',
            'sendTo' => 'required|string|in:all,role,user',
            'deliveryMethod' => 'required|string'
        ]);

        $notification = new Notification();
        $notification->title = $data['title'];
        $notification->message = $data['message'];
        $notification->role_id = $data['role_id'] ?? null;
        $notification->sendTo = $data['sendTo'];
        $notification->deliveryMethod = $data['deliveryMethod'];
        $notification->save();

        // Add text field for React compatibility
        $notification->text = $notification->message;

        return response()->json([
            'status' => true,
            'message' => 'Notification created successfully',
            'data' => $notification->toArray(),
        ], 201);
    }

    // Mark single notification as read FOR THE CURRENT USER ONLY
    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Check if this user has already read this notification
        $existingRead = Read_Notification::where('user_id', $user->id)
            ->where('notification_id', $id)
            ->first();

        if (!$existingRead) {
            // Create a read record for THIS USER ONLY
            Read_Notification::create([
                'user_id' => $user->id,
                'notification_id' => $id
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    // Mark all notifications as read for CURRENT USER ONLY
    public function markAllAsRead()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get all notification IDs that this user should see
        $notificationIds = Notification::where(function ($query) use ($user) {
            $query->where('sendTo', 'all') // Global notifications
                ->orWhere(function ($subQuery) use ($user) {
                    $subQuery->where('sendTo', 'role')
                        ->where('role_id', $user->role_id);
                });
            // Note: Removed user-specific logic since your schema doesn't have user_id field
        })->pluck('id')->toArray();

        // Get notification IDs that THIS USER has already read
        $alreadyReadIds = Read_Notification::where('user_id', $user->id)
            ->pluck('notification_id')
            ->toArray();

        // Find notification IDs that THIS USER hasn't read yet
        $unreadIds = array_diff($notificationIds, $alreadyReadIds);

        // Create read records for THIS USER ONLY for unread notifications
        $recordsToInsert = array_map(function ($notificationId) use ($user) {
            return [
                'user_id' => $user->id, // IMPORTANT: User-specific
                'notification_id' => $notificationId,
                'created_at' => now(),
                'updated_at' => now()
            ];
        }, $unreadIds);

        if (!empty($recordsToInsert)) {
            Read_Notification::insert($recordsToInsert);
        }

        return response()->json([
            'status' => true,
            'message' => 'All notifications marked as read for this user'
        ]);
    }

    // Get unread count for CURRENT USER ONLY
    public function getUnreadCount()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Get all notification IDs that this user should see
        $notificationIds = Notification::where(function ($query) use ($user) {
            $query->where('sendTo', 'all') // Global notifications
                ->orWhere(function ($subQuery) use ($user) {
                    $subQuery->where('sendTo', 'role')
                        ->where('role_id', $user->role_id);
                });
            // Note: Removed user-specific logic since your schema doesn't have user_id field
        })->pluck('id');

        // Count notifications that THIS USER has read
        $readCount = Read_Notification::where('user_id', $user->id)
            ->whereIn('notification_id', $notificationIds)
            ->count();

        // Calculate unread count for THIS USER
        $unreadCount = $notificationIds->count() - $readCount;

        return response()->json([
            'status' => true,
            'data' => ['unread_count' => $unreadCount],
            'message' => 'Unread count fetched successfully'
        ]);
    }
}
