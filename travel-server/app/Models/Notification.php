<?php

// app/Models/Notification.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'role_id',
        'sendTo',
        'deliveryMethod'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with Role
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // Relationship with ReadNotifications
    public function readBy()
    {
        return $this->hasMany(Read_Notification::class);
    }

    // Accessor to add text field for React compatibility
    public function getTextAttribute()
    {
        return $this->message;
    }
}


