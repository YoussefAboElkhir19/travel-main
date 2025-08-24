<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;
    public $targetUsers;

    public function __construct(Notification $notification, array $targetUsers = [])
    {
        $this->notification = $notification->load('role');
        $this->targetUsers = $targetUsers;

        // Add text field for React compatibility
        $this->notification->text = $this->notification->message;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->notification->sendTo === 'all') {
            // Broadcast to all authenticated users
            $channels[] = new Channel('notifications.all');
        } elseif ($this->notification->sendTo === 'role') {
            // Broadcast to specific role
            $channels[] = new Channel('notifications.role.' . $this->notification->role_id);
        }

        // Also broadcast to specific users if provided
        foreach ($this->targetUsers as $userId) {
            $channels[] = new PrivateChannel('notifications.user.' . $userId);
        }

        return $channels;
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'notification' => [
                'id' => $this->notification->id,
                'title' => $this->notification->title,
                'message' => $this->notification->message,
                'text' => $this->notification->text, // For React compatibility
                'sendTo' => $this->notification->sendTo,
                'role_id' => $this->notification->role_id,
                'role' => $this->notification->role,
                'deliveryMethod' => $this->notification->deliveryMethod,
                'created_at' => $this->notification->created_at,
                'is_read' => false, // New notifications are always unread
            ],
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'notification.sent';
    }
}
