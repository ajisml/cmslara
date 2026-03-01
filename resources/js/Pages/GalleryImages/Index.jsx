import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Image as ImageIcon,
    ImageUp,
    Pencil,
    Plus,
    Search,
    ShieldCheck,
    Trash2,
    UserCircle2,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';

const defaultData = {
    gallery_id: '',
    title: '',
    caption: '',
    alt_text: '',
    image: null,
    use_watermark: false,
    sort_order: 0,
    is_active: true,
};

function makeSelectStyles() {
    const isDark = document.documentElement.classList.contains('dark');

    return {
        control: (base, state) => ({
            ...base,
            minHeight: 40,
            borderRadius: 10,
            borderColor: state.isFocused ? '#1f9cef' : isDark ? 'hsl(220 15% 18%)' : '#cbd5e1',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(31, 156, 239, 0.2)' : 'none',
            backgroundColor: isDark ? 'hsl(220 18% 13%)' : '#ffffff',
            '&:hover': { borderColor: '#1f9cef' },
        }),
        menu: (base) => ({
            ...base,
            borderRadius: 10,
            border: `1px solid ${isDark ? 'hsl(220 15% 18%)' : '#e2e8f0'}`,
            overflow: 'hidden',
            backgroundColor: isDark ? 'hsl(220 18% 13%)' : '#ffffff',
            zIndex: 40,
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? isDark
                    ? 'rgba(31, 156, 239, 0.2)'
                    : 'rgba(31, 156, 239, 0.12)'
                : state.isSelected
                  ? '#1f9cef'
                  : isDark
                    ? 'hsl(220 18% 13%)'
                    : '#ffffff',
            color: state.isSelected ? '#ffffff' : isDark ? '#e2e8f0' : '#334155',
            cursor: 'pointer',
        }),
        singleValue: (base) => ({ ...base, color: isDark ? '#e2e8f0' : '#334155' }),
        input: (base) => ({ ...base, color: isDark ? '#e2e8f0' : '#334155' }),
        placeholder: (base) => ({ ...base, color: '#94a3b8' }),
        noOptionsMessage: (base) => ({ ...base, color: isDark ? '#94a3b8' : '#64748b' }),
    };
}

function ErrorText({ message }) {
    if (!message) return null;
    return <p className="text-xs text-rose-500">{message}</p>;
}

export default function GalleryImagesIndex({ images, galleries, filters, stats }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [galleryFilter, setGalleryFilter] = useState(filters.gallery_id ? String(filters.gallery_id) : '');
    const [editingItem, setEditingItem] = useState(null);

    const form = useForm(defaultData);
    const selectStyles = makeSelectStyles();
    const menuPortalTarget = typeof window !== 'undefined' ? document.body : null;

    const galleryOptions = useMemo(
        () => (galleries || []).map((gallery) => ({ value: String(gallery.id), label: gallery.title })),
        [galleries],
    );

    const selectedGalleryOption = useMemo(
        () => galleryOptions.find((option) => option.value === String(form.data.gallery_id || '')) || null,
        [galleryOptions, form.data.gallery_id],
    );

    const selectedGalleryFilterOption = useMemo(
        () => galleryOptions.find((option) => option.value === String(galleryFilter || '')) || null,
        [galleryFilter, galleryOptions],
    );

    const submit = (event) => {
        event.preventDefault();

        if (editingItem) {
            form.transform((data) => ({ ...data, _method: 'put' })).post(route('gallery-images.update', editingItem.id), {
                preserveScroll: true,
                forceFormData: true,
                onSuccess: () => {
                    form.reset();
                    form.setData('sort_order', 0);
                    form.setData('is_active', true);
                    form.setData('use_watermark', false);
                    setEditingItem(null);
                },
            });
            return;
        }

        form.post(route('gallery-images.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                form.setData('sort_order', 0);
                form.setData('is_active', true);
                form.setData('use_watermark', false);
            },
        });
    };

    const applyFilter = (event) => {
        event.preventDefault();
        const params = {};

        if (search.trim() !== '') params.search = search.trim();
        if (galleryFilter !== '') params.gallery_id = galleryFilter;
        if (statusFilter !== '') params.status = statusFilter;

        router.get(route('gallery-images.index'), params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setSearch('');
        setStatusFilter('');
        setGalleryFilter('');
        router.get(route('gallery-images.index'), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const editItem = (item) => {
        setEditingItem(item);
        form.setData({
            gallery_id: String(item.gallery_id),
            title: item.title ?? '',
            caption: item.caption ?? '',
            alt_text: item.alt_text ?? '',
            image: null,
            use_watermark: false,
            sort_order: item.sort_order ?? 0,
            is_active: item.is_active,
        });
        form.clearErrors();
    };

    const cancelEdit = () => {
        setEditingItem(null);
        form.reset();
        form.setData('sort_order', 0);
        form.setData('is_active', true);
        form.setData('use_watermark', false);
        form.clearErrors();
    };

    const deleteItem = async (item) => {
        const result = await Swal.fire({
            title: 'Hapus gambar?',
            text: `Gambar "${item.title || item.alt_text || item.id}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;
        router.delete(route('gallery-images.destroy', item.id), { preserveScroll: true });
    };

    const statCards = [
        { label: 'Total Gambar', value: stats.total, icon: ImageUp, color: 'text-primary' },
        { label: 'Active', value: stats.active, icon: ImageIcon, color: 'text-emerald-500' },
        { label: 'Inactive', value: stats.inactive, icon: XCircle, color: 'text-rose-500' },
        { label: 'Watermarked', value: stats.watermarked, icon: ShieldCheck, color: 'text-sky-500' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Gambar Management" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gambar Management</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        CRUD gambar gallery dengan validasi upload ketat (image only, max 2MB), kompres otomatis, dan watermark opsional.
                    </p>
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
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingItem ? 'Edit Gambar' : 'Tambah Gambar'}</h2>
                        <form onSubmit={submit} className="mt-4 space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Pilih Gallery</label>
                                <Select
                                    options={galleryOptions}
                                    isClearable
                                    isSearchable
                                    placeholder="Cari gallery..."
                                    value={selectedGalleryOption}
                                    onChange={(option) => form.setData('gallery_id', option?.value ?? '')}
                                    styles={selectStyles}
                                    menuPortalTarget={menuPortalTarget}
                                    menuPosition="fixed"
                                    noOptionsMessage={() => 'Gallery tidak ditemukan'}
                                />
                                <ErrorText message={form.errors.gallery_id} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Judul Gambar (opsional)</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Foto Pembukaan Acara"
                                    value={form.data.title}
                                    onChange={(event) => form.setData('title', event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
                                <ErrorText message={form.errors.title} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Alt Text</label>
                                <input
                                    type="text"
                                    placeholder="Deskripsi gambar"
                                    value={form.data.alt_text}
                                    onChange={(event) => form.setData('alt_text', event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
                                <ErrorText message={form.errors.alt_text} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Caption (opsional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Keterangan tambahan"
                                    value={form.data.caption}
                                    onChange={(event) => form.setData('caption', event.target.value)}
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
                                <ErrorText message={form.errors.caption} />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">File Gambar (jpg/png/webp, max 2MB)</label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp"
                                    onChange={(event) => form.setData('image', event.target.files?.[0] ?? null)}
                                    className="w-full rounded-[0.625rem] border border-slate-300 bg-white text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white dark:border-border-dark dark:bg-slate-900/30"
                                />
                                <ErrorText message={form.errors.image} />
                                {editingItem?.image_url && <img src={editingItem.image_url} alt={editingItem.title || 'Gallery image'} className="mt-2 h-24 w-full rounded-md object-cover" />}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="use_watermark_image"
                                    type="checkbox"
                                    checked={Boolean(form.data.use_watermark)}
                                    onChange={(event) => form.setData('use_watermark', event.target.checked)}
                                    className="rounded border-slate-300 text-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/40"
                                />
                                <label htmlFor="use_watermark_image" className="text-sm text-slate-600 dark:text-slate-300">Terapkan watermark logo (kanan bawah)</label>
                            </div>
                            <ErrorText message={form.errors.use_watermark} />

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Urutan</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.sort_order}
                                        onChange={(event) => form.setData('sort_order', Number(event.target.value || 0))}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                    <ErrorText message={form.errors.sort_order} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Status</label>
                                    <select
                                        value={form.data.is_active ? '1' : '0'}
                                        onChange={(event) => form.setData('is_active', event.target.value === '1')}
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
                                    <button type="button" onClick={cancelEdit} className="rounded-[0.625rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800">Batal</button>
                                )}
                                <button type="submit" className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                                    <Plus className="h-4 w-4" />
                                    {editingItem ? 'Perbarui' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="surface-card overflow-hidden xl:col-span-2">
                        <form onSubmit={applyFilter} className="border-b border-slate-200 p-4 dark:border-border-dark">
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
                                <div className="space-y-1 xl:col-span-2">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Cari Judul / Caption / Alt Text</label>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Cari gambar..."
                                            className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Gallery</label>
                                    <Select
                                        options={galleryOptions}
                                        isClearable
                                        isSearchable
                                        placeholder="Semua Gallery"
                                        value={selectedGalleryFilterOption}
                                        onChange={(option) => setGalleryFilter(option?.value ?? '')}
                                        styles={selectStyles}
                                        menuPortalTarget={menuPortalTarget}
                                        menuPosition="fixed"
                                        noOptionsMessage={() => 'Gallery tidak ditemukan'}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Status</label>
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
                                <button type="submit" className="rounded-[0.625rem] bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90">Terapkan Filter</button>
                                <button type="button" onClick={resetFilter} className="rounded-[0.625rem] border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800">Reset</button>
                            </div>
                        </form>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-border-dark">
                                <thead className="bg-slate-50 dark:bg-slate-900/20">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Gambar</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Gallery</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                    {images.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {item.image_url ? <img src={item.image_url} alt={item.alt_text || item.title || 'Gallery image'} className="h-12 w-16 rounded-md object-cover" /> : <span className="inline-flex h-12 w-16 items-center justify-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800"><ImageIcon className="h-4 w-4" /></span>}
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title || '-'}</p>
                                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.alt_text || 'Tanpa alt text'}</p>
                                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Order: {item.sort_order}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.gallery?.title || '-'}</p>
                                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><UserCircle2 className="h-3.5 w-3.5" />{item.uploader?.name || '-'}</p>
                                                {item.is_watermarked && <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-sky-100 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"><ShieldCheck className="h-3 w-3" />Watermark</p>}
                                            </td>
                                            <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-semibold ${item.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}`}>{item.is_active ? 'Active' : 'Inactive'}</span></td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <button type="button" onClick={() => editItem(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></button>
                                                    <button type="button" onClick={() => deleteItem(item)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {images.data.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Belum ada data gambar.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap justify-end gap-1 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                            {images.links.map((link, idx) => (
                                <Link
                                    key={`${idx}-${link.label}`}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
                                    className={`rounded-md border px-3 py-1.5 text-sm ${link.active ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
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