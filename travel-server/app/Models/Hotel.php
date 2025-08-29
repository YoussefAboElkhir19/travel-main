<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Hotel extends Model
{

    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'booking_number',
        'check_in_date',
        'check_out_date',
        'number_of_guests',
        'number_of_rooms',
        'room_type',
        'status',
        'notes',
    ];

    public function reservations()
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

}
