<?php

namespace App\Http\Resources;

use App\Models\Role;
use App\Models\RoomReservation;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource{

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'floor' => $this->floor,
            'serial_number' => $this->serial_number,
            'room_number' => $this->room_number,
            'price' => $this->price,
            'status' => $this->status
        ];
    }

}
