<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeManage($request);

        $search = (string) $request->query('search', '');
        $status = (string) $request->query('status', '');
        if (!in_array($status, ['read', 'unread'], true)) {
            $status = '';
        }

        $messages = ContactMessage::query()
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            })
            ->when($status !== '', function ($query) use ($status): void {
                $query->where('is_read', $status === 'read');
            })
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (ContactMessage $message): array => [
                'id' => $message->id,
                'name' => $message->name,
                'email' => $message->email,
                'phone_number' => $message->phone_number,
                'message' => $message->message,
                'is_read' => $message->is_read,
                'read_at' => $message->read_at?->format('Y-m-d H:i'),
                'source_url' => $message->source_url,
                'created_at' => $message->created_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('ContactMessages/Index', [
            'messages' => $messages,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => [
                'total' => ContactMessage::count(),
                'read' => ContactMessage::where('is_read', true)->count(),
                'unread' => ContactMessage::where('is_read', false)->count(),
            ],
        ]);
    }

    public function markRead(Request $request, ContactMessage $contactMessage): RedirectResponse
    {
        $this->authorizeManage($request);

        $contactMessage->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        return back()->with('success', 'Kontak ditandai sudah dibaca.');
    }

    public function show(Request $request, ContactMessage $contactMessage): Response
    {
        $this->authorizeManage($request);

        if (!$contactMessage->is_read) {
            $contactMessage->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
            $contactMessage->refresh();
        }

        return Inertia::render('ContactMessages/Show', [
            'message' => [
                'id' => $contactMessage->id,
                'name' => $contactMessage->name,
                'email' => $contactMessage->email,
                'phone_number' => $contactMessage->phone_number,
                'message' => $contactMessage->message,
                'is_read' => $contactMessage->is_read,
                'read_at' => $contactMessage->read_at?->format('Y-m-d H:i'),
                'source_url' => $contactMessage->source_url,
                'ip_address' => $contactMessage->ip_address,
                'created_at' => $contactMessage->created_at?->format('Y-m-d H:i'),
            ],
        ]);
    }

    public function markUnread(Request $request, ContactMessage $contactMessage): RedirectResponse
    {
        $this->authorizeManage($request);

        $contactMessage->update([
            'is_read' => false,
            'read_at' => null,
        ]);

        return back()->with('success', 'Kontak ditandai belum dibaca.');
    }

    public function destroy(Request $request, ContactMessage $contactMessage): RedirectResponse
    {
        $this->authorizeManage($request);
        $contactMessage->delete();

        return back()->with('success', 'Kontak masuk berhasil dihapus.');
    }

    private function authorizeManage(Request $request): void
    {
        abort_unless(
            in_array((string) $request->user()?->role, ['superadmin', 'admin'], true),
            403
        );
    }
}
