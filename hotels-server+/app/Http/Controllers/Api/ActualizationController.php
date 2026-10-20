<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoomReservation;
use Carbon\Carbon;

class ActualizationController extends Controller
{
    public function actualization(){
        $now = Carbon::now();
        $today = Carbon::now()->startOfDay();

         // 1) Drop PENDING reservations created before today
        //    (request was yesterday or earlier and never accepted)
        $deletedPending = RoomReservation::where('status', 'PENDING')
            ->where('created_at', '<', $today)
            ->delete();

        // 2) Mark ACCEPTED reservations as EXPIRED once their stay is over:
        //    reserved_at + days <= now
        $markedExpired = RoomReservation::where('status', 'ACCEPTED')
            ->whereNotNull('reserved_at')
            ->whereRaw('DATE_ADD(reserved_at, INTERVAL days DAY) <= ?', [$now])
            ->update(['status' => 'EXPIRED']);



        // 3) After 15:00 local time, delete all EXPIRED reservations
        $deletedExpired = 0;
        if ($now->hour >= 15) {
            $deletedExpired = RoomReservation::where('status', 'EXPIRED')->delete();
        } 

        return response([
            'run_at'  => $now->toDateTimeString(),
            'message' => 'Reservation date are actual now!'
        ]);
    }

}
