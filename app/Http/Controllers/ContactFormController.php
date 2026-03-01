<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactFormController extends Controller
{
    public function store(StoreContactMessageRequest $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();

        $recentDuplicateExists = ContactMessage::query()
            ->where('email', $validated['email'])
            ->where('message', $validated['message'])
            ->where('created_at', '>=', now()->subMinutes(5))
            ->exists();

        if ($recentDuplicateExists) {
            return $this->failureResponse(
                $request,
                'Pesan serupa baru saja dikirim. Coba lagi beberapa menit lagi.',
                429
            );
        }

        ContactMessage::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'message' => $validated['message'],
            'source_url' => $validated['source_url'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'is_read' => false,
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Pesan berhasil dikirim.',
            ]);
        }

        return back()->with('success', 'Pesan berhasil dikirim.');
    }

    private function failureResponse(
        Request $request,
        string $message,
        int $status
    ): JsonResponse|RedirectResponse {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
            ], $status);
        }

        return back()->with('error', $message);
    }
}
