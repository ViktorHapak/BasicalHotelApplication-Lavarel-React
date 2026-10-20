<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required',
                'string',
                'unique:users,name',
                'max:55',
                'regex:/^[^!\.\?\;\,\:\&@]+$/'],
            'email' => 'required|email|unique:users,email',
            'birth' => 'required|date|after:1910-01-01',
            'password' => ['required',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!.\?;,:&@]).+$/'],
            'role' =>'sometimes|string|in:ROLE_User,ROLE_Admin'
        ];
    }
}
