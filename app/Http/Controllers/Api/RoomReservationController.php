<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomReservationResource;
use App\Models\Room;
use App\Models\RoomReservation;
use App\Http\Requests\StoreRoomReservationRequest;
use App\Http\Requests\UpdateRoomReservationRequest;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RoomReservationController extends Controller
{


    public function index(Request $request)
    {
        //
        $query = RoomReservation::query();

        if($request->has('user')){
            $query->whereHas('user', fn($q) =>
             $q->where('name', 'like', '%' . $request->input('user') . '%')
            );
        }


        if($request->has('floor')){
            if($request->input('floor') != "0"){
                $query->whereHas('room', fn($q) =>
                 $q->where('floor', $request->input('floor'))
                );
            }
        }

        if($request->has('status')){
            if(request('status') != "all"){
                $query->whereIn('status', [$request->status]);
            }

        }

        return RoomReservationResource::collection($query->orderBy('id', 'asc')->paginate(10));

    }



    public function store(StoreRoomReservationRequest $request)
    {
        //
        $data = $request->validated();
        $data['user_id'] = User::where('name', $data['user'])->first()->id;
        $data['room_id'] = Room::where('room_number',$data['room'])->first()->id;
        $data['cost'] = Room::where('room_number',$data['room'])->first()->price * $data['days'];
        $data['status'] = 'PENDING';
        $data['reserved_at'] = Carbon::create(1899, 12, 31, 0, 0, 0);

        try{
            $roomReservation = RoomReservation::create($data);
        } catch (UniqueConstraintViolationException  $e) {
            return response([
                "message" => "Room already requested!"
            ], 422);
        }

        return response(new RoomReservationResource($roomReservation), 201);
    }



    public function show(RoomReservation $roomreservation)
    {
        return response(new RoomReservationResource($roomreservation), 200);
    }

    public function showById($id)
    {
        $reservation = RoomReservation::findOrFail($id);
        return new RoomReservationResource($reservation);
    }



    public function update(UpdateRoomReservationRequest $request, RoomReservation $roomReservation)
    {
        $data = $request->validated();
        $data['user_id'] = User::where('name', $data['user'])->first()->id;
        $data['room_id'] = Room::where('room_number',$data['room'])->first()->id;
        if($data['status'] == 'PENDING'){
            $data['status'] = 'ACCEPTED';
            $data['reserved_at'] = Carbon::now();
            $roomReservation->update($data);
            return response(new RoomReservationResource($roomReservation));
        }

        return response([
            'message' => 'The reservation has already approved!'
        ], 422);

    }

    public function updateById(UpdateRoomReservationRequest $request, $id)
    {
        $data = $request->validated();
        $reservation = RoomReservation::findOrFail($id);
        if($reservation->status == 'PENDING'){
            $reservation->update(['status' => 'ACCEPTED', 'reserved_at' => Carbon::now()]);
            return response(new RoomReservationResource($reservation));
        }

        return response([
            'message' => 'The reservation has already approved!'
        ], 422);

    }


    public function destroy(RoomReservation $roomReservation)
    {
        if($roomReservation->status=='PENDING'){
            $roomReservation->delete();
            return response("", 204);
        }

        else return response([
            "message" => 'The reservation has already approved! Are you sure to delete it?'
        ], 422);

    }

    public function destroyById($id)
    {
        $reservation = RoomReservation::findOrFail($id);
        if($reservation->status=='PENDING'){
            $reservation->delete();
            return response("", 204);
        }

        else return response([
            "message" => 'A rendelés jóvá lett hagyva! Biztosan törli?'
        ], 422);
    }

    public function destroyAnyway($id)
    {
        $reservation = RoomReservation::findOrFail($id);
        $reservation->delete();
        return response("", 204);
    }

    public function actualization(){
        $now = Carbon::now();
        $today = Carbon::now()->startOfDay();

        /* // 1) Drop PENDING reservations created before today
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
        } */

        return response([
            'run_at'  => $now->toDateTimeString(),
            'message' => 'Reservation date are actual now!'
        ]);
    }
}
