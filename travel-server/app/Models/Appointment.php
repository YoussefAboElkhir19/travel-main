<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'appointment_type',
        'appointment_date',
        'status',
        'location',
        'notes',
    ];
    public function reservations()
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

}
