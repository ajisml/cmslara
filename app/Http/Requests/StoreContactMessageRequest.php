<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreContactMessageRequest extends FormRequest
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
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email:rfc,dns', 'max:180'],
            'phone_number' => [
                'required',
                'string',
                'max:32',
                'regex:/^[0-9+\-\s().]{8,22}$/',
            ],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            'website' => ['nullable', 'string', 'max:1'],
            'source_url' => ['nullable', 'url', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $strip = static function (?string $value): string {
            $raw = (string) ($value ?? '');
            $clean = strip_tags($raw);
            $clean = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $clean);

            return trim((string) $clean);
        };

        $this->merge([
            'name' => $strip($this->input('name')),
            'email' => strtolower($strip($this->input('email'))),
            'phone_number' => $strip($this->input('phone_number')),
            'message' => $strip($this->input('message')),
            'website' => $strip($this->input('website')),
            'source_url' => $strip($this->input('source_url')),
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $payload = strtolower(
                implode(' ', [
                    (string) $this->input('name', ''),
                    (string) $this->input('email', ''),
                    (string) $this->input('phone_number', ''),
                    (string) $this->input('message', ''),
                ])
            );

            $maliciousPatterns = [
                '/<\s*script/i',
                '/javascript\s*:/i',
                '/data\s*:\s*text\/html/i',
                '/on\w+\s*=/i',
                '/union\s+select/i',
                '/<\s*iframe/i',
                '/<\s*object/i',
                '/<\s*embed/i',
            ];

            foreach ($maliciousPatterns as $pattern) {
                if (preg_match($pattern, $payload) === 1) {
                    $validator->errors()->add(
                        'message',
                        'Konten terdeteksi tidak aman.'
                    );
                    break;
                }
            }

            if ((string) $this->input('website', '') !== '') {
                $validator->errors()->add('website', 'Spam terdeteksi.');
            }
        });
    }
}
