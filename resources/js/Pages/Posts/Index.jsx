
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { Head, Link, router, useForm } from '@inertiajs/react';
import $ from 'jquery';
import {
    BookCopy,
    Eye,
    FileText,
    Hash,
    History,
    Image as ImageIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
    UserCircle2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Select from 'react-select';
import 'summernote/dist/summernote-lite.css';
import Swal from 'sweetalert2';

const defaultData = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail: null,
    category_id: '',
    hashtag_ids: [],
    meta_description: '',
    meta_keywords: '',
};

function makeSelectStyles() {
    const isDark = document.documentElement.classList.contains('dark');

    return {
        control: (base, state) => ({
            ...base,
            minHeight: 40,
            borderRadius: 10,
            borderColor: state.isFocused
                ? '#1f9cef'
                : isDark
                  ? 'hsl(220 15% 18%)'
                  : '#cbd5e1',
            boxShadow: state.isFocused ? '0 0 0 2px rgba(31, 156, 239, 0.2)' : 'none',
            backgroundColor: isDark ? 'hsl(220 18% 13%)' : '#ffffff',
            '&:hover': {
                borderColor: '#1f9cef',
            },
        }),
        menu: (base) => ({
            ...base,
            borderRadius: 10,
            border: `1px solid ${isDark ? 'hsl(220 15% 18%)' : '#e2e8f0'}`,
            overflow: 'hidden',
            backgroundColor: isDark ? 'hsl(220 18% 13%)' : '#ffffff',
            zIndex: 40,
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
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
        singleValue: (base) => ({
            ...base,
            color: isDark ? '#e2e8f0' : '#334155',
        }),
        input: (base) => ({
            ...base,
            color: isDark ? '#e2e8f0' : '#334155',
        }),
        placeholder: (base) => ({
            ...base,
            color: isDark ? '#94a3b8' : '#94a3b8',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: isDark ? '#94a3b8' : '#64748b',
        }),
    };
}

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

export default function PostsIndex({
    posts,
    filters,
    authors,
    categories,
    hashtags,
    topPosts,
    stats,
}) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [authorFilter, setAuthorFilter] = useState(
        filters.author_id ? String(filters.author_id) : '',
    );
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category_id ? String(filters.category_id) : '',
    );
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [editingItem, setEditingItem] = useState(null);
    const [editorFailed, setEditorFailed] = useState(false);
    const [hashtagQuery, setHashtagQuery] = useState('');
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

    const selectedHashtagSet = useMemo(
        () => new Set((form.data.hashtag_ids || []).map((id) => String(id))),
        [form.data.hashtag_ids],
    );

    const selectedHashtags = useMemo(
        () =>
            (form.data.hashtag_ids || [])
                .map((id) => hashtags.find((tag) => String(tag.id) === String(id)))
                .filter(Boolean),
        [form.data.hashtag_ids, hashtags],
    );

    const hashtagQueryTrimmed = hashtagQuery.trim();
    const showHashtagAutocomplete = hashtagQueryTrimmed.startsWith('#');
    const hashtagKeyword = showHashtagAutocomplete
        ? hashtagQueryTrimmed.slice(1).toLowerCase()
        : '';

    const hashtagSuggestions = useMemo(() => {
        if (!showHashtagAutocomplete) {
            return [];
        }

        return hashtags
            .filter((tag) => !selectedHashtagSet.has(String(tag.id)))
            .filter((tag) =>
                hashtagKeyword === ''
                    ? true
                    : tag.slug.toLowerCase().includes(hashtagKeyword) ||
                      tag.name.toLowerCase().includes(hashtagKeyword),
            )
            .slice(0, 8);
    }, [hashtags, hashtagKeyword, selectedHashtagSet, showHashtagAutocomplete]);

    const selectStyles = makeSelectStyles();

    const categoryOptions = useMemo(
        () =>
            categories.map((category) => ({
                value: String(category.id),
                label: category.name,
            })),
        [categories],
    );

    const authorOptions = useMemo(
        () =>
            authors.map((author) => ({
                value: String(author.id),
                label: author.name,
            })),
        [authors],
    );

    const selectedCategoryOption = useMemo(
        () =>
            categoryOptions.find(
                (option) => option.value === String(form.data.category_id || ''),
            ) || null,
        [categoryOptions, form.data.category_id],
    );

    const selectedAuthorFilterOption = useMemo(
        () =>
            authorOptions.find(
                (option) => option.value === String(authorFilter || ''),
            ) || null,
        [authorFilter, authorOptions],
    );

    const selectedCategoryFilterOption = useMemo(
        () =>
            categoryOptions.find(
                (option) => option.value === String(categoryFilter || ''),
            ) || null,
        [categoryFilter, categoryOptions],
    );

    const menuPortalTarget = typeof window !== 'undefined' ? document.body : null;

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

        const response = await axios.post(route('posts.upload-image'), formData, {
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
                    placeholder: 'Tulis konten postingan di sini...',
                    toolbar: [
                        ['style', ['style']],
                        ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
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
                                        text:
                                            error?.response?.data?.message ||
                                            'Tidak dapat mengunggah gambar ke server.',
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

    const addHashtag = (hashtagId) => {
        const id = String(hashtagId);
        const next = (form.data.hashtag_ids || []).map((item) => String(item));
        if (next.includes(id)) return;

        form.setData('hashtag_ids', [...next, id]);
        setHashtagQuery('');
    };

    const removeHashtag = (hashtagId) => {
        const id = String(hashtagId);
        const next = (form.data.hashtag_ids || [])
            .map((item) => String(item))
            .filter((item) => item !== id);
        form.setData('hashtag_ids', next);
    };

    const onHashtagKeyDown = (event) => {
        if (event.key === 'Enter' && showHashtagAutocomplete) {
            event.preventDefault();

            if (hashtagSuggestions.length > 0) {
                addHashtag(hashtagSuggestions[0].id);
            }
        }

        if (
            event.key === 'Backspace' &&
            hashtagQueryTrimmed === '' &&
            (form.data.hashtag_ids || []).length > 0
        ) {
            const lastId = String(form.data.hashtag_ids[form.data.hashtag_ids.length - 1]);
            removeHashtag(lastId);
        }
    };

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
            form.put(route('posts.update', editingItem.id), {
                preserveScroll: true,
                forceFormData: true,
                onError: handleSubmitError,
                onSuccess: () => {
                    form.reset();
                    form.setData('hashtag_ids', []);
                    setHashtagQuery('');
                    setEditorContent('');
                    setEditingItem(null);
                },
            });
            return;
        }

        form.post(route('posts.store'), {
            preserveScroll: true,
            forceFormData: true,
            onError: handleSubmitError,
            onSuccess: () => {
                form.reset();
                form.setData('hashtag_ids', []);
                setHashtagQuery('');
                setEditorContent('');
            },
        });
    };

    const applyFilter = (event) => {
        event.preventDefault();
        const params = {};

        if (search.trim() !== '') {
            params.search = search.trim();
        }

        if (authorFilter !== '') {
            params.author_id = authorFilter;
        }

        if (categoryFilter !== '') {
            params.category_id = categoryFilter;
        }

        if (statusFilter !== '') {
            params.status = statusFilter;
        }

        router.get(route('posts.index'), params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const resetFilter = () => {
        setSearch('');
        setAuthorFilter('');
        setCategoryFilter('');
        setStatusFilter('');
        router.get(route('posts.index'), {}, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const editItem = (item) => {
        setEditingItem(item);
        form.setData({
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt ?? '',
            content: item.content ?? '',
            thumbnail: null,
            category_id: item.category?.id ? String(item.category.id) : '',
            hashtag_ids: (item.hashtags || []).map((tag) => String(tag.id)),
            meta_description: item.meta_description ?? '',
            meta_keywords: item.meta_keywords ?? '',
        });
        setHashtagQuery('');
        form.clearErrors();
        setEditorContent(item.content ?? '');
    };

    const cancelEdit = () => {
        setEditingItem(null);
        form.reset();
        form.setData('hashtag_ids', []);
        setHashtagQuery('');
        form.clearErrors();
        setEditorContent('');
    };

    const deleteItem = async (item) => {
        const result = await Swal.fire({
            title: 'Hapus postingan?',
            text: `Postingan "${item.title}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;

        router.delete(route('posts.destroy', item.id), { preserveScroll: true });
    };

    const runWorkflowAction = async (item, action) => {
        const actionMap = {
            submit_review: {
                title: 'Ajukan ke review?',
                confirmText: 'Ya, ajukan',
                routeName: 'posts.workflow.submit-review',
            },
            approve: {
                title: 'Approve postingan ini?',
                confirmText: 'Ya, approve',
                routeName: 'posts.workflow.approve',
            },
            publish: {
                title: 'Publish postingan ini?',
                confirmText: 'Ya, publish',
                routeName: 'posts.workflow.publish',
            },
            send_back: {
                title: 'Kembalikan ke draft?',
                confirmText: 'Ya, kembalikan',
                routeName: 'posts.workflow.send-back',
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
            const response = await axios.get(route('posts.revisions', item.id));
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
            route('posts.rollback', {
                post: revisionModal.item.id,
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
        { label: 'Total Postingan', value: stats.total, icon: BookCopy, color: 'text-primary' },
        { label: 'Review', value: stats.review, icon: Eye, color: 'text-sky-500' },
        { label: 'Approved', value: stats.approved, icon: FileText, color: 'text-violet-500' },
        { label: 'Published', value: stats.published, icon: FileText, color: 'text-emerald-500' },
        { label: 'Draft', value: stats.draft, icon: Pencil, color: 'text-amber-500' },
        { label: 'Total Views', value: stats.views, icon: Hash, color: 'text-slate-500' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Postingan" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Kelola Postingan
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        CRUD postingan blog, Summernote full tools, upload gambar
                        konten, kategori, hashtag, dan metadata SEO.
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

                <section className="surface-card p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {editingItem ? 'Edit Postingan' : 'Tambah Postingan'}
                    </h2>

                    <form onSubmit={submit} className="mt-4 space-y-3">
                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Judul Postingan
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Tips SEO 2026"
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
                                    placeholder="tips-seo-2026"
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
                                        form.setData('thumbnail', event.target.files?.[0] ?? null)
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
                                    Thumbnail saat ini. Upload file baru jika ingin mengganti.
                                </p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Excerpt / Ringkasan
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Ringkasan singkat isi postingan"
                                value={form.data.excerpt}
                                onChange={(event) =>
                                    form.setData('excerpt', event.target.value)
                                }
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Kategori
                                </label>
                                <Select
                                    options={categoryOptions}
                                    isClearable
                                    isSearchable
                                    placeholder="Pilih kategori..."
                                    value={selectedCategoryOption}
                                    onChange={(option) =>
                                        form.setData('category_id', option?.value ?? '')
                                    }
                                    styles={selectStyles}
                                    menuPortalTarget={menuPortalTarget}
                                    menuPosition="fixed"
                                    noOptionsMessage={() => 'Kategori tidak ditemukan'}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Hashtag (ketik `#` untuk autocomplete, multiple)
                                </label>
                                <div className="relative rounded-[0.625rem] border border-slate-300 bg-white p-2 dark:border-border-dark dark:bg-slate-900/30">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {selectedHashtags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"
                                            >
                                                #{tag.slug}
                                                <button
                                                    type="button"
                                                    onClick={() => removeHashtag(tag.id)}
                                                    className="rounded p-0.5 text-primary/80 hover:bg-primary/20 hover:text-primary"
                                                    title={`Hapus #${tag.slug}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}

                                        <input
                                            type="text"
                                            value={hashtagQuery}
                                            onChange={(event) => setHashtagQuery(event.target.value)}
                                            onKeyDown={onHashtagKeyDown}
                                            placeholder="#ketik-hashtag"
                                            className="min-w-[180px] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
                                        />
                                    </div>

                                    {showHashtagAutocomplete && (
                                        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-52 overflow-y-auto rounded-[0.625rem] border border-slate-200 bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:border-border-dark dark:bg-card-dark">
                                            {hashtagSuggestions.length > 0 ? (
                                                hashtagSuggestions.map((tag) => (
                                                    <button
                                                        key={tag.id}
                                                        type="button"
                                                        onClick={() => addHashtag(tag.id)}
                                                        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                                    >
                                                        <Hash className="h-4 w-4 text-slate-400" />
                                                        <span className="font-semibold text-slate-700 dark:text-slate-100">
                                                            #{tag.slug}
                                                        </span>
                                                        <span className="truncate text-xs text-slate-400">
                                                            {tag.name}
                                                        </span>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="px-2 py-2 text-xs text-slate-500 dark:text-slate-400">
                                                    Tidak ada hashtag yang cocok.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Contoh: ketik <span className="font-semibold">#seo</span> lalu
                                    pilih dari autocomplete.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                Meta Description
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Ringkasan postingan untuk SEO"
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
                                placeholder="seo, website, tutorial"
                                value={form.data.meta_keywords}
                                onChange={(event) =>
                                    form.setData('meta_keywords', event.target.value)
                                }
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
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
                                Konten Postingan (Summernote)
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
                        onSubmit={applyFilter}
                        className="border-b border-slate-200 p-4 dark:border-border-dark"
                    >
                        <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
                            <div className="space-y-1 xl:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Cari Judul / Slug / Meta
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Cari postingan..."
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Author
                                </label>
                                <Select
                                    options={authorOptions}
                                    isClearable
                                    isSearchable
                                    placeholder="Semua Author"
                                    value={selectedAuthorFilterOption}
                                    onChange={(option) =>
                                        setAuthorFilter(option?.value ?? '')
                                    }
                                    styles={selectStyles}
                                    menuPortalTarget={menuPortalTarget}
                                    menuPosition="fixed"
                                    noOptionsMessage={() => 'Author tidak ditemukan'}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Kategori
                                </label>
                                <Select
                                    options={categoryOptions}
                                    isClearable
                                    isSearchable
                                    placeholder="Semua Kategori"
                                    value={selectedCategoryFilterOption}
                                    onChange={(option) =>
                                        setCategoryFilter(option?.value ?? '')
                                    }
                                    styles={selectStyles}
                                    menuPortalTarget={menuPortalTarget}
                                    menuPosition="fixed"
                                    noOptionsMessage={() => 'Kategori tidak ditemukan'}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    Status
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
                                        Postingan
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Author / Kategori
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Views
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Publish
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                {posts.data.map((item) => (
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
                                                        /{item.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="inline-flex items-center gap-1 text-sm text-slate-700 dark:text-slate-200">
                                                <UserCircle2 className="h-4 w-4" />
                                                {item.author?.name || '-'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {item.category?.name || 'Tanpa kategori'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-md px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}
                                            >
                                                {statusLabel(item.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {item.views_count.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                            {item.published_at || '-'}
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
                        {posts.links.map((link, idx) => (
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
                        Postingan Paling Banyak di Views
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                        {topPosts.map((item, idx) => (
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
                        {topPosts.length === 0 && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Belum ada data postingan.
                            </p>
                        )}
                    </div>
                </section>
            </section>
        </AuthenticatedLayout>
    );
}
