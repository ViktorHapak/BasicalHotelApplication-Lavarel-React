<?php

// app/Console/Kernel.php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Schedule to run every hour (to check and expire), and deletes at 15:00
        $schedule->command('app:expire-reservations')->hourly()
            ->withoutOverlapping()
            ->runInBackground();

        // OR if you only want to run exactly at 15:00
        // $schedule->command('app:expire-reservations')->dailyAt('15:00');
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
