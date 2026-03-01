<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:120'],
            'url' => ['nullable', 'string', 'max:255'],
            'target' => ['required', 'string', 'in:_self,_blank'],
            'icon' => ['nullable', 'string', 'max:100'],
            'parent_id' => ['nullable', 'integer', 'exists:menus,id'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
