<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
class Subscription extends Model
{
    //
     use HasFactory;

    protected $fillable = [
        'company_id',
        'plan',
        'status',
        'expires_at',
        'features'
    ];

    protected $casts = [
        'features' => 'array',
        'expires_at' => 'datetime'
    ];

    /**
     * Get the company that owns the subscription.
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Check if subscription is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->expires_at > now();
    }

    /**
     * Get days until expiry
     */
    public function getDaysUntilExpiry(): int
    {
        if (!$this->expires_at) return 0;
        
        return max(0, $this->expires_at->diffInDays(now()));
    }
}
