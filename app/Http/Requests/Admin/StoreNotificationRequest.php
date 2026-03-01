<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreNotificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'superadmin';
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
            'message' => ['required', 'string', 'max:5000'],
            'type' => ['required', 'in:info,success,warning,danger'],
            'target_role' => ['required', 'in:all,superadmin,admin,editor,author,viewer'],
            'link_url' => ['nullable', 'url', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $publishedAt = $this->input('published_at');

        $this->merge([
            'is_active' => (bool) $this->boolean('is_active'),
            'published_at' => blank($publishedAt) ? null : $publishedAt,
        ]);
    }
}
