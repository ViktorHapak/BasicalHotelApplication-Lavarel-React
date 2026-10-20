<?php

use App\Http\Controllers\Api\ActualizationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomReservationController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\UserController;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/api/logout', [AuthController::class, 'logout']);

    Route::get('/api/user', [AuthController::class, function (Request $request) {
        return new UserResource($request->user());
    }]);

    Route::apiResource('/api/users', UserController::class);
    Route::apiResource('/api/rooms', RoomController::class);
    Route::apiResource('/api/reservations', RoomReservationController::class);

    Route::get('/api/floors', [RoomController::class, 'getFloors']);

    Route::get('api/reservations/show/{id}', [RoomReservationController::class, 'showById']);

    Route::put('api/reservations/update/{id}', [RoomReservationController::class, 'updateById']);
    Route::put('api/actualize', [ActualizationController::class, 'actualization']);

    Route::delete('api/reservations/delete/{id}', [RoomReservationController::class, 'destroyById']);
    Route::delete('api/reservations/delete/confirm/{id}',
        [RoomReservationController::class, 'destroyAnyway']);
});

Route::middleware('api')->group(function () {
    // API routes here
    Route::post('/api/signup', [AuthController::class, 'signup']);
    Route::post('/api/login', [AuthController::class, 'login']);
});

Route::post('/api/test', function () {
    return ['status' => 'ok'];
}); //just for testing

Route::get('/api/test', function () {
    return ['status' => 'ok'];
}); //just for testing
