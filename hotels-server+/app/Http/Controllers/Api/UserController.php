<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateRoomRequest;
use App\Http\Resources\RoomResource;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\Room;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use function PHPUnit\Framework\isNull;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        if($request->has('name')){
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        if($request->has('role')){
            switch ($request->input('role')) {
                case 'ROLE_User':  {$query->where('role', 0); break;}
                case 'ROLE_Admin':  {$query->where('role', 1); break;}
                default: break;
            }

            /* Alternative scenario to perform filtration:
            if($request->input('role') != 'all'){
                $roleValue = Role::fromString($request->input('role'))->value;
                if($roleValue){
                    $query->where('role',  $roleValue);
                }
            }*/
        }

        return UserResource::collection(
            $query->orderBy('id', 'asc')->paginate(10)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        $data['role'] = 0;
        $user = User::create($data);
        return response(new UserResource($user), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }
        if (isset($data['role'])) {
            $data['role'] = Role::fromString($data['role'])?->value ?? 0;
        }
        $user->update($data);

        return response(new UserResource($user),201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response("", 204);
    }
}
