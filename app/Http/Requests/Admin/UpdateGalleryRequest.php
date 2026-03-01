<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateGalleryRequest extends FormRequest
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
        $galleryId = $this->route('gallery')?->id;

        return [
            'title' => ['required', 'string', 'max:140'],
            'slug' => [
                'required',
                'string',
                'max:170',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('galleries', 'slug')->ignore($galleryId),
            ],
            'description' => ['nullable', 'string', 'max:3000'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'use_watermark' => ['nullable', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $title = (string) $this->input('title', '');
        $slugInput = (string) $this->input('slug', '');

        $this->merge([
            'slug' => Str::slug($slugInput !== '' ? $slugInput : $title),
            'use_watermark' => (bool) $this->boolean('use_watermark'),
        ]);
    }
}
