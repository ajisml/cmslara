import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCheck,
    Eye,
    Mail,
    MailOpen,
    Search,
    ShieldAlert,
    Trash2,
    Undo2,
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

function excerpt(text, max = 120) {
    const value = String(text || '').trim();
    if (value.length <= max) return value;
    return `${value.slice(0, max)}...`;
}

export default function ContactMessagesIndex({ messages, filters, stats }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const applyFilter = (event) => {
        event.preventDefault();
        const params = {};

        if (search.trim() !== '') params.search = search.trim();
        if (statusFilter !== '') params.status = statusFilter;

        router.get(route('contact-messages.index'), params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setSearch('');
        setStatusFilter('');
        router.get(route('contact-messages.index'), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const markRead = (item) => {
        router.put(
            route('contact-messages.mark-read', item.id),
            {},
            { preserveScroll: true },
        );
    };

    const markUnread = (item) => {
        router.put(
            route('contact-messages.mark-unread', item.id),
            {},
            { preserveScroll: true },
        );
    };

    const deleteItem = async (item) => {
        const result = await Swal.fire({
            title: 'Hapus kontak masuk?',
            text: `Data dari ${item.name} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;

        router.delete(route('contact-messages.destroy', item.id), {
            preserveScroll: true,
        });
    };

    const statCards = [
        { label: 'Total Kontak', value: stats.total, icon: Mail, color: 'text-primary' },
        { label: 'Belum Dibaca', value: stats.unread, icon: ShieldAlert, color: 'text-amber-500' },
        { label: 'Sudah Dibaca', value: stats.read, icon: MailOpen, color: 'text-emerald-500' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Kontak Masuk" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Kontak Masuk
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Kelola pesan dari form kontak laman, dengan status sudah dibaca dan
                        belum dibaca.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <article key={card.label} className="surface-card p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        {card.label}
                                    </p>
                                    <Icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {card.value.toLocaleString()}
                                </p>
                            </article>
                        );
                    })}
                </div>

                <section className="surface-card overflow-hidden">
                    <form
                        onSubmit={applyFilter}
                        className="border-b border-slate-200 p-4 dark:border-border-dark"
                    >
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Cari Nama / Email / No. HP / Isi
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Cari kontak masuk..."
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="unread">Belum Dibaca</option>
                                    <option value="read">Sudah Dibaca</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                type="submit"
                                className="rounded-[0.625rem] bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                                Terapkan Filter
                            </button>
                            <button
                                type="button"
                                onClick={resetFilter}
                                className="rounded-[0.625rem] border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Reset
                            </button>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-border-dark">
                            <thead className="bg-slate-50 dark:bg-slate-900/20">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Nama
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        No. HP
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Isi
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                {messages.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/30 ${
                                            item.is_read ? '' : 'bg-amber-50/40 dark:bg-amber-500/5'
                                        }`}
                                    >
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {item.created_at}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                                            {item.email}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                                            {item.phone_number}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">
                                                {excerpt(item.message, 140)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                                    item.is_read
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                                }`}
                                            >
                                                {item.is_read ? 'Sudah dibaca' : 'Belum dibaca'}
                                            </span>
                                            {item.read_at && (
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    {item.read_at}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                {item.is_read ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => markUnread(item)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                                        title="Tandai belum dibaca"
                                                    >
                                                        <Undo2 className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => markRead(item)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                                                        title="Tandai dibaca"
                                                    >
                                                        <CheckCheck className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <Link
                                                    href={route('contact-messages.show', item.id)}
                                                    preserveScroll
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800"
                                                    title="Lihat detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteItem(item)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {messages.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            Belum ada kontak masuk.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap justify-end gap-1 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                        {messages.links.map((link, idx) => (
                            <Link
                                key={`${idx}-${link.label}`}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                className={`rounded-md border px-3 py-1.5 text-sm ${
                                    link.active
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800'
                                } ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </section>
            </section>
        </AuthenticatedLayout>
    );
}
