<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Role;
class Notification extends Model
{
    //
    
    protected $fillable = [
        'title',
        'message',
        'role_id',
        'sendTo',
        'deliveryMethod',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
    
}
