<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGalleryImageRequest extends FormRequest
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
            'gallery_id' => ['required', 'integer', 'exists:galleries,id'],
            'title' => ['nullable', 'string', 'max:160'],
            'caption' => ['nullable', 'string', 'max:2000'],
            'alt_text' => ['nullable', 'string', 'max:160'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'use_watermark' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sort_order' => (int) ($this->input('sort_order') ?? 0),
            'use_watermark' => (bool) $this->boolean('use_watermark'),
        ]);
    }
}
