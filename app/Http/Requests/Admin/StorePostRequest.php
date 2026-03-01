<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StorePostRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:200', 'regex:/^[a-z0-9-]+$/', 'unique:posts,slug'],
            'excerpt' => ['nullable', 'string', 'max:2000'],
            'content' => ['required', 'string'],
            'thumbnail' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:4096'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'hashtag_ids' => ['nullable', 'array'],
            'hashtag_ids.*' => ['integer', 'exists:hashtags,id'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
            'meta_keywords' => ['nullable', 'string', 'max:1000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $title = (string) $this->input('title', '');
        $slugInput = (string) $this->input('slug', '');

        $this->merge([
            'slug' => Str::slug($slugInput !== '' ? $slugInput : $title),
            'hashtag_ids' => array_values(array_filter((array) $this->input('hashtag_ids', []), fn ($id) => $id !== null && $id !== '')),
        ]);
    }
}
