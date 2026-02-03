<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            'name' => [
                'string',
                'max:55',
                "unique:users,name,{$this->id},id",
                'regex:/^[^!\\.\\?;\\,:\\@]+$/',
            ],
            'email' => [
                'email',
                "unique:users,email,{$this->id},id",
            ],
            'birth' => 'date|after:1910-01-01',
            'role' =>'sometimes|string|in:ROLE_User,ROLE_Admin'
        ];
    }
}
