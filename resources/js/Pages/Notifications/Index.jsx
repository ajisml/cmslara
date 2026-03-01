import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Bell,
    CheckCircle2,
    Pencil,
    Plus,
    Search,
    ShieldAlert,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

const defaultData = {
    title: '',
    message: '',
    type: 'info',
    target_role: 'all',
    link_url: '',
    published_at: '',
    is_active: true,
};

function toDatetimeLocal(value) {
    if (!value) return '';

    const normalized = String(value).replace(' ', 'T');
    return normalized.length === 16 ? normalized : normalized.slice(0, 16);
}

function ErrorText({ message }) {
    if (!message) return null;
    return <p className="text-xs text-rose-500">{message}</p>;
}

export default function NotificationsIndex({ notifications, filters, stats }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [targetRoleFilter, setTargetRoleFilter] = useState(filters.target_role ?? '');
    const [typeFilter, setTypeFilter] = useState(filters.type ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [editingItem, setEditingItem] = useState(null);

    const form = useForm(defaultData);

    const submit = (event) => {
        event.preventDefault();

        if (editingItem) {
            form.transform((data) => ({ ...data, _method: 'put' })).post(
                route('notifications.update', editingItem.id),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        form.reset();
                        form.setData('type', 'info');
                        form.setData('target_role', 'all');
                        form.setData('is_active', true);
                        setEditingItem(null);
                    },
                },
            );
            return;
        }

        form.post(route('notifications.store'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                form.setData('type', 'info');
                form.setData('target_role', 'all');
                form.setData('is_active', true);
            },
        });
    };

    const applyFilter = (event) => {
        event.preventDefault();
        const params = {};

        if (search.trim() !== '') params.search = search.trim();
        if (targetRoleFilter !== '') params.target_role = targetRoleFilter;
        if (typeFilter !== '') params.type = typeFilter;
        if (statusFilter !== '') params.status = statusFilter;

        router.get(route('notifications.index'), params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setSearch('');
        setTargetRoleFilter('');
        setTypeFilter('');
        setStatusFilter('');

        router.get(route('notifications.index'), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const editItem = (item) => {
        setEditingItem(item);
        form.setData({
            title: item.title,
            message: item.message,
            type: item.type,
            target_role: item.target_role,
            link_url: item.link_url ?? '',
            published_at: toDatetimeLocal(item.published_at),
            is_active: item.is_active,
        });
        form.clearErrors();
    };

    const cancelEdit = () => {
        setEditingItem(null);
        form.reset();
        form.setData('type', 'info');
        form.setData('target_role', 'all');
        form.setData('is_active', true);
        form.clearErrors();
    };

    const deleteItem = async (item) => {
        const result = await Swal.fire({
            title: 'Hapus notifikasi?',
            text: `Notifikasi "${item.title}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;

        router.delete(route('notifications.destroy', item.id), { preserveScroll: true });
    };

    const statCards = [
        { label: 'Total Notif', value: stats.total, icon: Bell, color: 'text-primary' },
        {
            label: 'Active',
            value: stats.active,
            icon: CheckCircle2,
            color: 'text-emerald-500',
        },
        {
            label: 'Inactive',
            value: stats.inactive,
            icon: XCircle,
            color: 'text-rose-500',
        },
        {
            label: 'Target Superadmin',
            value: stats.superadmin_targeted,
            icon: ShieldAlert,
            color: 'text-amber-500',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Notif" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Kelola Notif
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Superadmin dapat membuat notifikasi laman untuk role tertentu,
                        termasuk notifikasi khusus superadmin.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <section className="surface-card p-5 xl:col-span-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {editingItem ? 'Edit Notifikasi' : 'Tambah Notifikasi'}
                        </h2>
                        <form onSubmit={submit} className="mt-4 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Judul
                                </label>
                                <input
                                    type="text"
                                    placeholder="Judul notifikasi"
                                    value={form.data.title}
                                    onChange={(event) => form.setData('title', event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
                                <ErrorText message={form.errors.title} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Pesan
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Isi notifikasi"
                                    value={form.data.message}
                                    onChange={(event) => form.setData('message', event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
                                <ErrorText message={form.errors.message} />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Tipe
                                    </label>
                                    <select
                                        value={form.data.type}
                                        onChange={(event) => form.setData('type', event.target.value)}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    >
                                        <option value="info">Info</option>
                                        <option value="success">Success</option>
                                        <option value="warning">Warning</option>
                                        <option value="danger">Danger</option>
                                    </select>
                                    <ErrorText message={form.errors.type} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Target Role
                                    </label>
                                    <select
                                        value={form.data.target_role}
                                        onChange={(event) =>
                                            form.setData('target_role', event.target.value)
                                        }
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    >
                                        <option value="all">Semua Role</option>
                                        <option value="superadmin">Superadmin</option>
                                        <option value="admin">Admin</option>
                                        <option value="editor">Editor</option>
                                        <option value="author">Author</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <ErrorText message={form.errors.target_role} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Link Tujuan (opsional)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={form.data.link_url}
                                    onChange={(event) => form.setData('link_url', event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
                                <ErrorText message={form.errors.link_url} />
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Jadwal Tayang (opsional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={form.data.published_at}
                                        onChange={(event) =>
                                            form.setData('published_at', event.target.value)
                                        }
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                    <ErrorText message={form.errors.published_at} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Status
                                    </label>
                                    <select
                                        value={form.data.is_active ? '1' : '0'}
                                        onChange={(event) =>
                                            form.setData('is_active', event.target.value === '1')
                                        }
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                    <ErrorText message={form.errors.is_active} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                {editingItem && (
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="rounded-[0.625rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Batal
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    {editingItem ? 'Perbarui' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="surface-card overflow-hidden xl:col-span-2">
                        <form
                            onSubmit={applyFilter}
                            className="border-b border-slate-200 p-4 dark:border-border-dark"
                        >
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
                                <div className="space-y-1 xl:col-span-2">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Cari Judul / Pesan / Link
                                    </label>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Cari notifikasi..."
                                            className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Role
                                    </label>
                                    <select
                                        value={targetRoleFilter}
                                        onChange={(event) => setTargetRoleFilter(event.target.value)}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    >
                                        <option value="">Semua Role</option>
                                        <option value="all">Semua</option>
                                        <option value="superadmin">Superadmin</option>
                                        <option value="admin">Admin</option>
                                        <option value="editor">Editor</option>
                                        <option value="author">Author</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Tipe
                                    </label>
                                    <select
                                        value={typeFilter}
                                        onChange={(event) => setTypeFilter(event.target.value)}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    >
                                        <option value="">Semua Tipe</option>
                                        <option value="info">Info</option>
                                        <option value="success">Success</option>
                                        <option value="warning">Warning</option>
                                        <option value="danger">Danger</option>
                                    </select>
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
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
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
                                            Notifikasi
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Target / Tipe
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Jadwal
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                    {notifications.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                                                    {item.message}
                                                </p>
                                                {item.link_url && (
                                                    <p className="mt-1 truncate text-xs text-primary">
                                                        {item.link_url}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-slate-700 dark:text-slate-200">
                                                    {item.target_role}
                                                </p>
                                                <p
                                                    className={`mt-1 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                                                        item.type === 'success'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                                            : item.type === 'warning'
                                                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                                              : item.type === 'danger'
                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                                                                : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                                                    }`}
                                                >
                                                    {item.type}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                    by {item.creator?.name || '-'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                                <p>
                                                    Publish: {item.published_at || 'Langsung'}
                                                </p>
                                                <p className="mt-1">
                                                    Status:{' '}
                                                    <span
                                                        className={
                                                            item.is_active
                                                                ? 'text-emerald-600 dark:text-emerald-300'
                                                                : 'text-rose-600 dark:text-rose-300'
                                                        }
                                                    >
                                                        {item.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => editItem(item)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteItem(item)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {notifications.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                                            >
                                                Belum ada notifikasi.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap justify-end gap-1 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                            {notifications.links.map((link, idx) => (
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
                </div>
            </section>
        </AuthenticatedLayout>
    );
}