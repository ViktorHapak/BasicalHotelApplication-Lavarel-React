<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\SignupRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function signup(SignupRequest $request){
        $data = $request->validated();
        /** @var \App\Models\User $user */
        $role = $data['role'] ?? 'ROLE_User';
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'birth' => $data['birth'],
            'password' =>bcrypt($data['password']),
            'role' => Role::fromString($role)->value
        ]);

        return response($user);
    }

    //
    public function login(LoginRequest $request){
        $credentials = $request->validated();

        /** @var User $user */

        $login = $request->input('login');
        $password = $request->input('password');

        $fieldType = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'name';

        $user =  $fieldType == 'email' ?
            User::where('email', $credentials['login'])->first() :
            User::where('name', $credentials['login'])->first();



        if(!$user) return response([
            'message' => 'User not found!'], 422);
        else if (!Hash::check($credentials['password'], $user->password))
            return response([
                'message' => 'Wrong password!'], 422);


        $token = $user->createToken('main')->plainTextToken;
        return response(compact('token', 'user'));
    }

    public function logout(Request $request){
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()->delete();
        return response('', 204);

    }
}
