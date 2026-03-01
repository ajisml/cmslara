<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateHashtagRequest extends FormRequest
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
        $hashtagId = $this->route('hashtag')?->id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'required',
                'string',
                'max:120',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('hashtags', 'slug')->ignore($hashtagId),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'views_count' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $name = (string) $this->input('name', '');
        $slugInput = (string) $this->input('slug', '');

        $this->merge([
            'slug' => Str::slug($slugInput !== '' ? $slugInput : $name),
            'views_count' => $this->input('views_count') ?? 0,
        ]);
    }
}
