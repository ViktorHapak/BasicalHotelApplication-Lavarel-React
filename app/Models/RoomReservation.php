<?php

namespace App\Models;



use Illuminate\Database\Eloquent\Model;

class RoomReservation extends Model{


    protected $fillable = [
        'user_id',
        'room_id',
        'cost',
        'days',
        'reserved_at',
        'status',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

}
