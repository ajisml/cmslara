<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdatePermissionRequest extends FormRequest
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
        $permissionId = $this->route('permission')?->id;

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'required',
                'string',
                'max:120',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('permissions', 'slug')->ignore($permissionId),
            ],
            'group_name' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9-]+$/'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $name = (string) $this->input('name', '');
        $slugInput = (string) $this->input('slug', '');
        $groupInput = (string) $this->input('group_name', '');

        $this->merge([
            'slug' => Str::slug($slugInput !== '' ? $slugInput : $name),
            'group_name' => Str::slug($groupInput !== '' ? $groupInput : 'general'),
        ]);
    }
}
