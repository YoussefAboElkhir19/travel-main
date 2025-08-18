<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class EmailAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email_address',
        'provider',
        'smtp_server',
        'smtp_port',
        'password_encrypted',
        'is_active'
    ];

    protected $hidden = [
        'password_encrypted'
    ];

    protected $casts = [
        'smtp_port' => 'integer',
        'is_active' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Encrypt password when saving
    public function setPasswordAttribute($value)
    {
        $this->attributes['password_encrypted'] = Crypt::encryptString($value);
    }

    // Decrypt password when retrieving
    public function getDecryptedPasswordAttribute()
    {
        return Crypt::decryptString($this->password_encrypted);
    }
}
