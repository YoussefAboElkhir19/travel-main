<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cruise extends Model
{
    use HasFactory,SoftDeletes;
    protected $fillable = [
        'cruise_name',
        'ship_name',
        'cabin_type',
        'departure_date',
        'arrival_date',
        'cruise_type',
        'departure_port',
        'arrival_port',
        'cruise_line',
        'status',
        'notes',
    ];

    public function reservations()
    {
        return $this->morphMany(Reservation::class, 'reservable');
    }

}
