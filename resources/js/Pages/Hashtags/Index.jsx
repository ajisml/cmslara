import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Eye, Hash, Pencil, Plus, Search, Tags, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import Swal from 'sweetalert2';

const defaultData = {
    name: '',
    slug: '',
    description: '',
    views_count: 0,
    is_active: true,
};

export default function HashtagsIndex({ hashtags, filters, topHashtags, stats }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editingItem, setEditingItem] = useState(null);

    const form = useForm(defaultData);

    const submit = (event) => {
        event.preventDefault();

        if (editingItem) {
            form.transform((data) => ({ ...data, _method: 'put' })).post(route('hashtags.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    setEditingItem(null);
                },
            });
            return;
        }

        form.post(route('hashtags.store'), {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const applySearch = (event) => {
        event.preventDefault();
        router.get(route('hashtags.index'), { search }, { preserveScroll: true, preserveState: true, replace: true });
    };

    const resetSearch = () => {
        setSearch('');
        router.get(route('hashtags.index'), {}, { preserveScroll: true, preserveState: true, replace: true });
    };

    const editItem = (item) => {
        setEditingItem(item);
        form.setData({
            name: item.name,
            slug: item.slug,
            description: item.description ?? '',
            views_count: item.views_count ?? 0,
            is_active: item.is_active,
        });
        form.clearErrors();
    };

    const cancelEdit = () => {
        setEditingItem(null);
        form.reset();
        form.clearErrors();
    };

    const deleteItem = async (item) => {
        const result = await Swal.fire({
            title: 'Hapus hastag?',
            text: `Hastag #${item.slug} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;

        router.delete(route('hashtags.destroy', item.id), { preserveScroll: true });
    };

    const statCards = [
        { label: 'Total Hastag', value: stats.total, icon: Tags, color: 'text-primary' },
        { label: 'Active', value: stats.active, icon: Hash, color: 'text-emerald-500' },
        { label: 'Inactive', value: stats.inactive, icon: XCircle, color: 'text-rose-500' },
        { label: 'Total Views', value: stats.views, icon: Eye, color: 'text-sky-500' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Hastag" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Kelola Hastag</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">CRUD hastag + ranking hastag paling banyak di views.</p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <article key={card.label} className="surface-card p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                                    <Icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{card.value.toLocaleString()}</p>
                            </article>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <section className="surface-card p-5 xl:col-span-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingItem ? 'Edit Hastag' : 'Tambah Hastag'}</h2>
                        <form onSubmit={submit} className="mt-4 space-y-3">
                            <input type="text" placeholder="Nama hastag" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <input type="text" placeholder="Slug (opsional)" value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <textarea rows={3} placeholder="Deskripsi" value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <input type="number" min="0" placeholder="Views" value={form.data.views_count} onChange={(e) => form.setData('views_count', Number(e.target.value || 0))} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <select value={form.data.is_active ? '1' : '0'} onChange={(e) => form.setData('is_active', e.target.value === '1')} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30">
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            <div className="flex justify-end gap-2">
                                {editingItem && <button type="button" onClick={cancelEdit} className="rounded-[0.625rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800">Batal</button>}
                                <button type="submit" className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><Plus className="h-4 w-4" />{editingItem ? 'Perbarui' : 'Simpan'}</button>
                            </div>
                        </form>
                    </section>

                    <section className="surface-card overflow-hidden xl:col-span-2">
                        <form onSubmit={applySearch} className="border-b border-slate-200 p-4 dark:border-border-dark">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari hastag..." className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <button type="button" onClick={resetSearch} className="rounded-[0.625rem] border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800">Reset</button>
                            </div>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-border-dark">
                                <thead className="bg-slate-50 dark:bg-slate-900/20">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Hastag</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Views</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                    {hashtags.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">#{item.slug}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{item.views_count.toLocaleString()}</td>
                                            <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <button type="button" onClick={() => editItem(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></button>
                                                    <button type="button" onClick={() => deleteItem(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap justify-end gap-1 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                            {hashtags.links.map((link) => (
                                <Link key={link.label} href={link.url || '#'} preserveScroll preserveState className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </section>
                </div>

                <section className="surface-card p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Hastag Paling Banyak di Views</h2>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                        {topHashtags.map((item, idx) => (
                            <article key={item.id} className="rounded-[0.625rem] border border-slate-200 p-3 dark:border-border-dark">
                                <p className="text-xs font-semibold text-slate-500">#{idx + 1}</p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">#{item.slug}</p>
                                <p className="mt-2 text-xs text-slate-500">{item.views_count.toLocaleString()} views</p>
                            </article>
                        ))}
                        {topHashtags.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada data hastag.</p>}
                    </div>
                </section>
            </section>
        </AuthenticatedLayout>
    );
}
