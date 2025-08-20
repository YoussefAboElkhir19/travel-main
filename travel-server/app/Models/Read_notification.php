<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Read_Notification extends Model
{
    use HasFactory;
    protected $table = 'read_notifications';

    protected $fillable = [
        'user_id',
        'notification_id',
        'read_at'
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // العلاقات
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notification()
    {
        return $this->belongsTo(Notification::class);
    }

    // Scopes للفلترة حسب التاريخ
    public function scopeReadToday($query)
    {
        return $query->whereDate('read_at', Carbon::today());
    }

    public function scopeReadYesterday($query)
    {
        return $query->whereDate('read_at', Carbon::yesterday());
    }

    public function scopeReadThisWeek($query)
    {
        return $query->whereBetween('read_at', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ]);
    }

    public function scopeReadLastWeek($query)
    {
        return $query->whereBetween('read_at', [
            Carbon::now()->subWeek()->startOfWeek(),
            Carbon::now()->subWeek()->endOfWeek()
        ]);
    }

    public function scopeReadThisMonth($query)
    {
        return $query->whereMonth('read_at', Carbon::now()->month)
                     ->whereYear('read_at', Carbon::now()->year);
    }

    public function scopeReadLastMonth($query)
    {
        return $query->whereMonth('read_at', Carbon::now()->subMonth()->month)
                     ->whereYear('read_at', Carbon::now()->subMonth()->year);
    }

    public function scopeReadThisYear($query)
    {
        return $query->whereYear('read_at', Carbon::now()->year);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByNotification($query, $notificationId)
    {
        return $query->where('notification_id', $notificationId);
    }

    public function scopeReadBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('read_at', [$startDate, $endDate]);
    }

    public function scopeReadAfter($query, $date)
    {
        return $query->where('read_at', '>', $date);
    }

    public function scopeReadBefore($query, $date)
    {
        return $query->where('read_at', '<', $date);
    }

    // Helper methods
    public function getReadTimeAgoAttribute()
    {
        return $this->read_at->diffForHumans();
    }

    public function isReadToday()
    {
        return $this->read_at->isToday();
    }

    public function isReadYesterday()
    {
        return $this->read_at->isYesterday();
    }

    public function isReadThisWeek()
    {
        return $this->read_at->between(
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        );
    }

    public function isReadThisMonth()
    {
        return $this->read_at->month === Carbon::now()->month &&
               $this->read_at->year === Carbon::now()->year;
    }

    public function isReadThisYear()
    {
        return $this->read_at->year === Carbon::now()->year;
    }

    public function getReadAtFormattedAttribute()
    {
        return $this->read_at->format('Y-m-d H:i:s');
    }

    public function getReadAtForHumansAttribute()
    {
        return $this->read_at->format('M j, Y \a\t g:i A');
    }

    // إحصائيات ثابتة
    public static function getReadingStatsForUser($userId)
    {
        return [
            'read_today' => static::byUser($userId)->readToday()->count(),
            'read_yesterday' => static::byUser($userId)->readYesterday()->count(),
            'read_this_week' => static::byUser($userId)->readThisWeek()->count(),
            'read_last_week' => static::byUser($userId)->readLastWeek()->count(),
            'read_this_month' => static::byUser($userId)->readThisMonth()->count(),
            'read_last_month' => static::byUser($userId)->readLastMonth()->count(),
            'read_this_year' => static::byUser($userId)->readThisYear()->count(),
            'total_read' => static::byUser($userId)->count(),
        ];
    }

    public static function getReadingActivityForUser($userId, $days = 30)
    {
        return static::byUser($userId)
            ->whereBetween('read_at', [
                Carbon::now()->subDays($days)->startOfDay(),
                Carbon::now()->endOfDay()
            ])
            ->selectRaw('DATE(read_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();
    }

    public static function getMostActiveReadingHours($userId)
    {
        return static::byUser($userId)
            ->selectRaw('HOUR(read_at) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->get();
    }

    // Boot method للتعامل مع الأحداث
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->read_at) {
                $model->read_at = Carbon::now();
            }
        });
    }
}
