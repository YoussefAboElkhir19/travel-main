<?php

use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Public channel for all authenticated users
Broadcast::channel('notifications.all', function ($user) {
    return $user !== null; // Any authenticated user can listen
});

// Channel for role-specific notifications
Broadcast::channel('notifications.role.{roleId}', function ($user, $roleId) {
    return $user && $user->role_id == $roleId;
});

// Private channel for user-specific notifications
Broadcast::channel('notifications.user.{userId}', function ($user, $userId) {
    return $user && $user->id == $userId;
});
