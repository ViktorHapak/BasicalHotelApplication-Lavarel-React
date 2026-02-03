<?php

namespace App\Console\Commands;

use App\Models\RoomReservation;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ExpireReservations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:expire-reservations';
    protected $description = 'Set expired status for overdue room reservations and delete them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        // Update all overdue reservations to 'EXPIRED'
        RoomReservation::where('status', 'ACCEPTED')
            ->whereRaw('DATE_ADD(reserved_at, INTERVAL days DAY) <= ?', [$now])
            ->update(['status' => 'EXPIRED']);

        if($now->hour() == 15){
            RoomReservation::where('status', 'EXPIRED')->delete();
        }
    }
}
