<?php

namespace App\Models;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes; // استيراد trait السوفت ديليت

use Illuminate\Database\Eloquent\Model;
use App\Models\Breakk;
use App\Models\User;
class Shift extends Model
{
    use SoftDeletes, HasFactory;
    protected $table = 'shifts';

    protected $fillable = [
        'user_id',
        'start_time',
        'end_time',
        'total_break_seconds',
        'notes'
    ];
    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'total_break_seconds' => 'integer'
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

    /**
     * Calculate total hours worked (excluding breaks)
     */
    public function getTotalHoursAttribute()
    {
        if ($this->start_time && $this->end_time) {
            $start = Carbon::parse($this->start_time);
            $end = Carbon::parse($this->end_time);
            $totalSeconds = $end->diffInSeconds($start);

            // Subtract break duration in seconds
            $workSeconds = $totalSeconds - ($this->total_break_seconds ?? 0);

            // Convert to hours with 2 decimal places
            return round($workSeconds / 3600, 2);
        }

        return 0;
    }

    /**
     * Get break duration in minutes for display
     */
    public function getBreakMinutesAttribute()
    {
        return round(($this->total_break_seconds ?? 0) / 60, 0);
    }

    /**
     * Get shift status based on end_time
     */
    public function getStatusAttribute()
    {
        if ($this->end_time) {
            return 'completed';
        }
        return 'active';
    }
}
