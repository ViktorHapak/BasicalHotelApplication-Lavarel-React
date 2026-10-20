<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Room extends Model{

    protected $fillable = [
        'floor',
        'serial_number',
        'room_number',
        'price'
    ];

    public $timestamps = false;

    public function reservations()
    {
        return $this->hasMany(RoomReservation::class);
    }

    protected function status() : Attribute {
        return Attribute::get(function () {
            $latestStatus = $this->reservations()->whereIn('status', ['PENDING','ACCEPTED','EXPIRED']);
                          // returns string|null

            return $latestStatus->count() > 0 ? "reserved": "free";
        });
    }


}
