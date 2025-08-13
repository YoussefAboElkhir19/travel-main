<?php

namespace App\Models;
use Illuminate\Database\Eloquent\SoftDeletes; // استيراد trait السوفت ديليت

use Illuminate\Database\Eloquent\Model;
use App\Models\Breakk;
use App\Models\User;
class Shift extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'user_id', 'start_time', 'end_time', 'total_break_seconds', 'notes'
    ];
    // User Relation 
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Breakk Relation 

    public function breaks()
    {
        return $this->hasMany(Breakk::class, 'shift_id');
    }
}
