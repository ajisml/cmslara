<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuRequest extends FormRequest
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
        $menuId = $this->route('menu')?->id;

        return [
            'title' => ['required', 'string', 'max:120'],
            'url' => ['nullable', 'string', 'max:255'],
            'target' => ['required', 'string', 'in:_self,_blank'],
            'icon' => ['nullable', 'string', 'max:100'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('menus', 'id'),
                Rule::notIn([$menuId]),
            ],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
