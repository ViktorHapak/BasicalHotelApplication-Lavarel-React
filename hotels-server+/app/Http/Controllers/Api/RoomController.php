<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Http\Resources\UserResource;
use App\Models\Room;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Models\RoomReservation;
use App\Models\User;
use GuzzleHttp\Psr7\Query;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     * @param Request $request
     * @param $q
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request)
    {
        //
        $query = Room::query();
        if($request->has('floor')){
            $query = $query->where('floor',$request->input('floor'));
        }

        if($request->has('status')){
            switch ($request->input('status')) {
                case "free": {
                    $query->whereDoesntHave('reservations');
                    break;
                }
                case "reserved": {
                    $query->whereHas('reservations', fn($q) =>
                          $q->whereIn('status', ['PENDING','ACCEPTED', 'EXPIRED'])
                    );
                    break;
                }
                default: break;
            }
        }

        return RoomResource::collection(
            $query->orderBy('room_number','asc')->paginate(10)
        );

    }

    public function getFloors(Request $request){

        //This controller-function is going to return floor-numbers, that occuring at rooms
        $floors = Room::query()->whereNotNull('floor')->select('floor')->distinct()
            ->orderBy('floor','asc')->pluck('floor');

        return response()->json([
            'data' => $floors->values(),  // ensure 0..n indexing
            'meta' => ['count' => $floors->count()],
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoomRequest $request)
    {
        $data = $request->validated();
        $data['room_number'] = $data['floor'] . "-" .$data['serial_number'];
        try{
            $room = Room::create($data);
        } catch (UniqueConstraintViolationException  $e) {
            return response([
                "message" => "Room already exists!"
            ], 422);
        }

        return response(new RoomResource($room), 201);
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Room $room)
    {
        return new RoomResource($room);
    }

    public function update(UpdateRoomRequest $request, Room $room)
    {
        $data = $request->validated();

        //Re
        if($room->reservations()->whereIn('status', ['PENDING','ACCEPTED','EXPIRED'])->exists()){
            return response([
                'message' => 'Room is currently requested! Unable to update'
            ], 422);
        }

        try{
            $room->update($data);
        } catch (UniqueConstraintViolationException  $e) {
            return response([
                "message" => "Room already exists!"
            ], 422);
        }


        return response(new RoomResource($room),201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        if($room->reservations()->whereIn('status',['PENDING','ACCEPTED', 'EXPIRED'])->exists()){
            return response([
                'message' => 'Room is currently requested! Unable to delete'
            ], 422);
        }

        $room->delete();
        return response("", 204);
    }
}
