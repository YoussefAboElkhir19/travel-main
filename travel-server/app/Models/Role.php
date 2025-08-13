<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    //
    // App\Models\Role.php
protected $casts = [
    'permissions' => 'array',
];

}
