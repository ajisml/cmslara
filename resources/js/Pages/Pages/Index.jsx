import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Head, Link, router, useForm } from '@inertiajs/react';
import $ from 'jquery';
import {
    Eye,
    FileText,
    Hash,
    History,
    Image as ImageIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import 'summernote/dist/summernote-lite.css';
import Swal from 'sweetalert2';

const defaultData = {
    title: '',
    slug: '',
    content: '',
    thumbnail: null,
    meta_description: '',
    meta_keywords: '',
    views_count: 0,
};

function statusLabel(status) {
    switch (status) {
        case 'review':
            return 'In Review';
        case 'approved':
            return 'Approved';
        case 'published':
            return 'Published';
        default:
            return 'Draft';
    }
}

function statusBadgeClass(status) {
    switch (status) {
        case 'review':
            return 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300';
        case 'approved':
            return 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300';
        case 'published':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
        default:
            return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
    }
}

export default function PagesIndex({ pages, filters, authors, topPages, stats }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [authorFilter, setAuthorFilter] = useState(
        filters.author_id ? String(filters.author_id) : '',
    );
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [editingItem, setEditingItem] = useState(null);
    const [editorFailed, setEditorFailed] = useState(false);
    const [revisionModal, setRevisionModal] = useState({
        open: false,
        item: null,
        loading: false,
        revisions: [],
    });

    const form = useForm(defaultData);
    const editorRef = useRef(null);
    const editorReadyRef = useRef(false);
    const setContentRef = useRef(form.setData);

    setContentRef.current = form.setData;

    const setEditorContent = (html) => {
        if (!editorReadyRef.current || !editorRef.current) {
            return;
        }

        const nextContent = html ?? '';
        const $editor = $(editorRef.current);
        const currentContent = $editor.summernote('code');

        if (currentContent !== nextContent) {
            $editor.summernote('code', nextContent);
        }
    };

    const uploadSummernoteImage = async (file) => {
        const csrfToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(route('pages.upload-image'), formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            },
        });

        return response.data?.url;
    };

    useEffect(() => {
        let mounted = true;
        let editorInstance = null;

        const initEditor = async () => {
            try {
                window.$ = window.jQuery = $;
                await import('summernote/dist/summernote-lite.js');

                if (!mounted || !editorRef.current) {
                    return;
                }

                editorInstance = $(editorRef.current);
                editorInstance.summernote({
                    height: 360,
                    placeholder: 'Tulis konten laman di sini...',
                    toolbar: [
                        ['style', ['style']],
                        ['font', ['bold', 'italic', 'underline', 'clear']],
                        ['fontname', ['fontname']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['height', ['height']],
                        ['table', ['table']],
                        ['insert', ['link', 'picture', 'video', 'hr']],
                        ['view', ['fullscreen', 'codeview', 'help']],
                    ],
                    callbacks: {
                        onChange: (contents) => {
                            setContentRef.current('content', contents);
                        },
                        onImageUpload: async (files) => {
                            for (const file of files) {
                                try {
                                    const imageUrl = await uploadSummernoteImage(file);
                                    if (imageUrl && editorInstance) {
                                        editorInstance.summernote('insertImage', imageUrl);
                                    }
                                } catch (error) {
                                    Swal.fire({
                                        title: 'Upload gagal',
                                        text: error?.response?.data?.message || 'Tidak dapat mengunggah gambar ke server.',
                                        icon: 'error',
                                    });
                                }
                            }
                        },
                    },
                });

                editorReadyRef.current = true;
                setEditorContent(defaultData.content);
            } catch (error) {
                setEditorFailed(true);
            }
        };

        initEditor();

        return () => {
            mounted = false;

            if (editorInstance && editorInstance.next('.note-editor').length) {
                editorInstance.summernote('destroy');
            }

            editorReadyRef.current = false;
        };
    }, []);

    const submit = (event) => {
        event.preventDefault();

        const handleSubmitError = (errors) => {
            const firstError = Object.values(errors || {})[0];
            Swal.fire({
                title: 'Gagal menyimpan',
                text:
                    typeof firstError === 'string'
                        ? firstError
                        : 'Periksa kembali data form yang wajib diisi.',
                icon: 'error',
            });
        };

        if (editingItem) {
            form.put(route('pages.update', editingItem.id), {
                preserveScroll: true,
                forceFormData: true,
                onError: handleSubmitError,
                onSuccess: () => {
                    form.reset();
                    setEditorContent('');
                    setEditingItem(null);
                },
            });
            return;
        }

        form.post(route('pages.store'), {
            preserveScroll: true,
            forceFormData: true,
            onError: handleSubmitError,
            onSuccess: () => {
                form.reset();
                setEditorContent('');
            },
        });
    };

    const applySearch = (event) => {
        event.preventDefault();
        const params = {};

        if (search.trim() !== '') {
            params.search = search.trim();
        }

        if (authorFilter !== '') {
            params.author_id = authorFilter;
        }

        if (statusFilter !== '') {
            params.status = statusFilter;
        }

        router.get(
            route('pages.index'),
            params,
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const resetSearch = () => {
        setSearch('');
        setAuthorFilter('');
        setStatusFilter('');
        router.get(
            route('pages.index'),
            {},
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const editItem = (item) => {
        setEditingItem(item);
        form.setData({
            title: item.title,
            slug: item.slug,
            content: item.content ?? '',
            thumbnail: null,
            meta_description: item.meta_description ?? '',
            meta_keywords: item.meta_keywords ?? '',
            views_count: item.views_count ?? 0,
        });
        form.clearErrors();
        setEditorContent(item.content ?? '');
    };

    const cancelEdit = () => {
        setEditingItem(null);
        form.reset();
        form.clearErrors();
        setEditorContent('');
    };

    const deleteItem = async (item) => {
        const result = await Swal.fire({
            title: 'Hapus laman?',
            text: `Laman "${item.title}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;

        router.delete(route('pages.destroy', item.id), { preserveScroll: true });
    };

    const runWorkflowAction = async (item, action) => {
        const actionMap = {
            submit_review: {
                title: 'Ajukan ke review?',
                confirmText: 'Ya, ajukan',
                routeName: 'pages.workflow.submit-review',
            },
            approve: {
                title: 'Approve laman ini?',
                confirmText: 'Ya, approve',
                routeName: 'pages.workflow.approve',
            },
            publish: {
                title: 'Publish laman ini?',
                confirmText: 'Ya, publish',
                routeName: 'pages.workflow.publish',
            },
            send_back: {
                title: 'Kembalikan ke draft?',
                confirmText: 'Ya, kembalikan',
                routeName: 'pages.workflow.send-back',
            },
        };

        const selected = actionMap[action];
        if (!selected) return;

        const result = await Swal.fire({
            title: selected.title,
            text: item.title,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: selected.confirmText,
            cancelButtonText: 'Batal',
            confirmButtonColor: '#1f9cef',
        });

        if (!result.isConfirmed) return;

        router.put(route(selected.routeName, item.id), {}, { preserveScroll: true });
    };

    const closeRevisionModal = () => {
        setRevisionModal({
            open: false,
            item: null,
            loading: false,
            revisions: [],
        });
    };

    const openRevisionModal = async (item) => {
        setRevisionModal({
            open: true,
            item,
            loading: true,
            revisions: [],
        });

        try {
            const response = await axios.get(route('pages.revisions', item.id));
            setRevisionModal((prev) => ({
                ...prev,
                loading: false,
                revisions: Array.isArray(response.data?.items) ? response.data.items : [],
            }));
        } catch (error) {
            setRevisionModal((prev) => ({ ...prev, loading: false }));
            Swal.fire({
                title: 'Gagal memuat riwayat',
                text: error?.response?.data?.message || 'Terjadi kesalahan saat memuat revisi.',
                icon: 'error',
            });
        }
    };

    const rollbackRevision = async (revision) => {
        if (!revisionModal.item) {
            return;
        }

        const result = await Swal.fire({
            title: `Rollback ke versi #${revision.version}?`,
            text: revisionModal.item.title,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, rollback',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#f59e0b',
        });

        if (!result.isConfirmed) return;

        router.put(
            route('pages.rollback', {
                page: revisionModal.item.id,
                revision: revision.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeRevisionModal();
                },
            },
        );
    };

    const statCards = [
        { label: 'Total Laman', value: stats.total, icon: FileText, color: 'text-primary' },
        { label: 'Review', value: stats.review, icon: Eye, color: 'text-sky-500' },
        { label: 'Approved', value: stats.approved, icon: FileText, color: 'text-violet-500' },
        { label: 'Published', value: stats.published, icon: ImageIcon, color: 'text-emerald-500' },
        { label: 'Draft', value: stats.draft, icon: FileText, color: 'text-amber-500' },
        { label: 'Total Views', value: stats.views, icon: Eye, color: 'text-sky-500' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Laman" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Kelola Laman
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Konten laman dengan Summernote, upload thumbnail, dan SEO
                        metadata.
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

                <div className="grid grid-cols-1 gap-6">
                    <section className="surface-card p-5">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {editingItem ? 'Edit Laman' : 'Tambah Laman'}
                        </h2>
                        <form onSubmit={submit} className="mt-4 space-y-3">
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Judul Laman
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Tentang Kami"
                                        value={form.data.title}
                                        onChange={(event) =>
                                            form.setData('title', event.target.value)
                                        }
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Slug (opsional, auto jika kosong)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="tentang-kami"
                                        value={form.data.slug}
                                        onChange={(event) =>
                                            form.setData('slug', event.target.value)
                                        }
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Thumbnail
                                    </label>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp,.svg"
                                        onChange={(event) =>
                                            form.setData(
                                                'thumbnail',
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                        className="w-full rounded-[0.625rem] border border-slate-300 bg-white text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                            </div>

                            {editingItem?.thumbnail_url && (
                                <div className="flex items-center gap-2 rounded-[0.625rem] border border-slate-200 p-2 dark:border-border-dark">
                                    <img
                                        src={editingItem.thumbnail_url}
                                        alt={editingItem.title}
                                        className="h-14 w-20 rounded-md object-cover"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Thumbnail saat ini. Upload file baru jika ingin
                                        mengganti.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Meta Description
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Ringkasan singkat halaman untuk SEO"
                                    value={form.data.meta_description}
                                    onChange={(event) =>
                                        form.setData('meta_description', event.target.value)
                                    }
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Meta Keywords
                                </label>
                                <input
                                    type="text"
                                    placeholder="cms, profil, perusahaan"
                                    value={form.data.meta_keywords}
                                    onChange={(event) =>
                                        form.setData('meta_keywords', event.target.value)
                                    }
                                    className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Views Count
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={form.data.views_count}
                                        onChange={(event) =>
                                            form.setData(
                                                'views_count',
                                                Number(event.target.value || 0),
                                            )
                                        }
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                            </div>

                            {editingItem && (
                                <div className="rounded-[0.625rem] border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-border-dark dark:bg-slate-900/30">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        Status workflow saat ini:
                                    </span>{' '}
                                    <span
                                        className={`rounded-md px-2 py-1 text-xs font-semibold ${statusBadgeClass(editingItem.status)}`}
                                    >
                                        {statusLabel(editingItem.status)}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Konten Laman (Summernote)
                                </label>
                                <textarea ref={editorRef} />
                                {editorFailed && (
                                    <p className="text-xs text-rose-500">
                                        Summernote gagal dimuat. Coba refresh halaman.
                                    </p>
                                )}
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
                                    disabled={form.processing}
                                    className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : editingItem
                                          ? 'Perbarui'
                                          : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="surface-card overflow-hidden">
                        <form
                            onSubmit={applySearch}
                            className="border-b border-slate-200 p-4 dark:border-border-dark"
                        >
                            <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
                                <div className="space-y-1 xl:col-span-2">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Cari Judul / Slug / Meta
                                    </label>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Cari laman..."
                                            className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Filter Author
                                    </label>
                                    <select
                                        value={authorFilter}
                                        onChange={(event) =>
                                            setAuthorFilter(event.target.value)
                                        }
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    >
                                        <option value="">Semua Author</option>
                                        {authors.map((author) => (
                                            <option key={author.id} value={author.id}>
                                                {author.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Filter Status
                                    </label>
                                    <select
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(event.target.value)
                                        }
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="review">In Review</option>
                                        <option value="approved">Approved</option>
                                        <option value="published">Published</option>
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
                                    onClick={resetSearch}
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
                                            Laman
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Meta
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Author
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Views
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
                                    {pages.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {item.thumbnail_url ? (
                                                        <img
                                                            src={item.thumbnail_url}
                                                            alt={item.title}
                                                            className="h-10 w-14 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <span className="inline-flex h-10 w-14 items-center justify-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800">
                                                            <ImageIcon className="h-4 w-4" />
                                                        </span>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                            {item.title}
                                                        </p>
                                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                            {item.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="max-w-[360px] truncate text-xs text-slate-500 dark:text-slate-400">
                                                    {item.meta_description || '-'}
                                                </p>
                                                <p className="mt-1 max-w-[360px] truncate text-xs text-slate-400 dark:text-slate-500">
                                                    {item.meta_keywords || '-'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                                {item.author?.name || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                                {item.views_count.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-md px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}
                                                >
                                                    {statusLabel(item.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap justify-end gap-1">
                                                    {item.workflow_actions?.submit_review && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                runWorkflowAction(
                                                                    item,
                                                                    'submit_review',
                                                                )
                                                            }
                                                            className="rounded-md border border-sky-200 px-2 py-1 text-xs font-semibold text-sky-600 hover:bg-sky-50 dark:border-sky-500/30 dark:text-sky-300 dark:hover:bg-sky-500/10"
                                                        >
                                                            Submit Review
                                                        </button>
                                                    )}
                                                    {item.workflow_actions?.approve && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                runWorkflowAction(item, 'approve')
                                                            }
                                                            className="rounded-md border border-violet-200 px-2 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-300 dark:hover:bg-violet-500/10"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {item.workflow_actions?.publish && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                runWorkflowAction(item, 'publish')
                                                            }
                                                            className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                                                        >
                                                            Publish
                                                        </button>
                                                    )}
                                                    {item.workflow_actions?.send_back && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                runWorkflowAction(item, 'send_back')
                                                            }
                                                            className="rounded-md border border-amber-200 px-2 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/10"
                                                        >
                                                            Send Back
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => openRevisionModal(item)}
                                                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800"
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            <History className="h-3.5 w-3.5" />
                                                            History
                                                        </span>
                                                    </button>
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
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-wrap justify-end gap-1 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                            {pages.links.map((link, idx) => (
                                <Link
                                    key={`${idx}-${link.label}`}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
                                    className={`rounded-md border px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800'
                                    } ${
                                        !link.url ? 'pointer-events-none opacity-40' : ''
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {revisionModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                        <div className="surface-card w-full max-w-2xl p-5">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                                        Riwayat Versi: {revisionModal.item?.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Total revisi: {revisionModal.item?.revisions_count ?? 0}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeRevisionModal}
                                    className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Tutup
                                </button>
                            </div>

                            {revisionModal.loading ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Memuat riwayat...
                                </p>
                            ) : revisionModal.revisions.length === 0 ? (
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Belum ada revisi.
                                </p>
                            ) : (
                                <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                                    {revisionModal.revisions.map((revision) => (
                                        <div
                                            key={revision.id}
                                            className="rounded-[0.625rem] border border-slate-200 p-3 dark:border-border-dark"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                        Versi #{revision.version}
                                                    </p>
                                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                        {revision.note || 'Tanpa catatan'}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        {revision.created_at} oleh {revision.creator}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => rollbackRevision(revision)}
                                                    className="rounded-md border border-amber-200 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/10"
                                                >
                                                    Rollback
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <section className="surface-card p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Laman Paling Banyak di Views
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                        {topPages.map((item, idx) => (
                            <article
                                key={item.id}
                                className="rounded-[0.625rem] border border-slate-200 p-3 dark:border-border-dark"
                            >
                                <p className="text-xs font-semibold text-slate-500">
                                    #{idx + 1}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    {item.thumbnail_url ? (
                                        <img
                                            src={item.thumbnail_url}
                                            alt={item.title}
                                            className="h-8 w-10 rounded object-cover"
                                        />
                                    ) : (
                                        <span className="inline-flex h-8 w-10 items-center justify-center rounded bg-slate-100 text-slate-400 dark:bg-slate-800">
                                            <ImageIcon className="h-4 w-4" />
                                        </span>
                                    )}
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {item.title}
                                    </p>
                                </div>
                                <p className="mt-1 truncate text-xs text-slate-500">
                                    /{item.slug}
                                </p>
                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                                    <Hash className="h-3.5 w-3.5" />
                                    {item.views_count.toLocaleString()} views
                                </p>
                            </article>
                        ))}
                        {topPages.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Belum ada data laman.
                            </p>
                        )}
                    </div>
                </section>
            </section>
        </AuthenticatedLayout>
    );
}
