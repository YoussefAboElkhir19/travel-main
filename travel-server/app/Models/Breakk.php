<?php

namespace App\Models;
use App\Models\Shift;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Breakk extends Model
{
    use SoftDeletes;
    protected $table = 'breaks';

    protected $fillable = [
        'shift_id',
        'start_time',
        'end_time',
        'notes'
    ];

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
