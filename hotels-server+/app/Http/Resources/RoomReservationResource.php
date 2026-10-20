<?php

namespace App\Http\Resources;

use App\Models\Role;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomReservationResource extends JsonResource{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => $this->user?->name,
            'floor' => $this->room?->floor,
            'room' => $this->room?->room_number,
            'cost' => $this->cost,
            'days' => $this->days,
            'created_at' => $this->created_at->format('Y-m-d h:m:s'),
            'reserved_at' => ($this->status === "PENDING") ? "-" : $this->reserved_at,
            'status' => $this->status
        ];
    }

}
