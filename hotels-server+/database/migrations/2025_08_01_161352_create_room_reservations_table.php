<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->unique(['user_id', 'room_id']);
            $table->unique('room_id');
            $table->unsignedInteger('cost');
            $table->unsignedInteger('days');
            $table->timestamps(); // includes created_at
            $table->dateTime('reserved_at')->nullable()->default(null);
            $table->string('status', 20)->check("status IN ('PENDING', 'ACCEPTED', 'EXPIRED')");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_reservations');
    }
};
