<?php

// app/Models/Role.php (if not already exists)
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description'

    ];
    protected $casts = [
        'permissions' => 'array',
    ];
    // Relationship with Users
    public function users()
    {
        return $this->hasMany(User::class);
    }

    // Relationship with Notifications
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }


}
