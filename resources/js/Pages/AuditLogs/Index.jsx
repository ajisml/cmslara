import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    FileClock,
    Search,
    ShieldAlert,
    Trash2,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';

export default function AuditLogsIndex({ logs, filters, roleOptions, stats }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [actionFilter, setActionFilter] = useState(filters.action ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? '');
    const [dateFilter, setDateFilter] = useState(filters.date ?? '');

    const applyFilter = (event) => {
        event.preventDefault();

        const params = {};
        if (search.trim() !== '') params.search = search.trim();
        if (actionFilter !== '') params.action = actionFilter;
        if (roleFilter !== '') params.role = roleFilter;
        if (dateFilter !== '') params.date = dateFilter;

        router.get(route('audit-logs.index'), params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setSearch('');
        setActionFilter('');
        setRoleFilter('');
        setDateFilter('');

        router.get(route('audit-logs.index'), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const statCards = [
        { label: 'Total Log', value: stats.total, icon: FileClock, color: 'text-primary' },
        { label: 'Hari Ini', value: stats.today, icon: Calendar, color: 'text-sky-500' },
        { label: 'Update', value: stats.updates, icon: Wrench, color: 'text-amber-500' },
        { label: 'Delete', value: stats.deletes, icon: Trash2, color: 'text-rose-500' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Audit Log" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Audit Log Aktivitas Admin
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Log aktivitas admin: siapa mengubah/menghapus apa, kapan, dan dari IP mana.
                        Halaman ini khusus superadmin.
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

                <section className="surface-card overflow-hidden">
                    <form
                        onSubmit={applyFilter}
                        className="border-b border-slate-200 p-4 dark:border-border-dark"
                    >
                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
                            <div className="space-y-1 xl:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Cari Actor / Route / Resource / IP
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Cari log..."
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Aksi
                                </label>
                                <select
                                    value={actionFilter}
                                    onChange={(event) => setActionFilter(event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                >
                                    <option value="">Semua Aksi</option>
                                    <option value="create">Create</option>
                                    <option value="update">Update</option>
                                    <option value="delete">Delete</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Role
                                </label>
                                <select
                                    value={roleFilter}
                                    onChange={(event) => setRoleFilter(event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                >
                                    <option value="">Semua Role</option>
                                    {roleOptions.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(event) => setDateFilter(event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
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
                                        Actor
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Aktivitas
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Resource
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        IP
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Waktu
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                {logs.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {item.actor?.name || '-'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {item.actor?.role || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                <Activity className="h-4 w-4" /> {item.action}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {item.method} - {item.route_name || '-'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {item.description || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-slate-700 dark:text-slate-200">
                                                {item.subject_label || '-'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Fields: {(item.payload_keys || []).join(', ') || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200">
                                                <ShieldAlert className="h-4 w-4" /> {item.ip_address || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                                            {item.created_at}
                                        </td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            Belum ada data audit log.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap justify-end gap-1 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                        {logs.links.map((link, idx) => (
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