<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes; 

class Leave_request extends Model
{
        use SoftDeletes; 

    protected $fillable = [
        'user_id',
        'leave_type',
        'leave_date',
        'notes',
        'status',
        'reviewed_by',
    ];

    /**
     * Get the user that owns the leave request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who reviewed the leave request.
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
