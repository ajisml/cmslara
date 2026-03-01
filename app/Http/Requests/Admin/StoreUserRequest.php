<?php

namespace App\Http\Requests\Admin;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone_number' => ['nullable', 'string', 'max:30', 'regex:/^\\+?[0-9]{8,20}$/', 'unique:users,phone_number'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
            'role' => ['required', 'string', Rule::in($this->availableRoles())],
            'is_active' => ['required', 'boolean'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    private function availableRoles(): array
    {
        $fallback = ['superadmin', 'admin', 'editor', 'author', 'viewer'];

        if (!Schema::hasTable('roles')) {
            return $fallback;
        }

        $roles = Role::query()->pluck('slug')->all();

        return $roles !== [] ? $roles : $fallback;
    }
}
