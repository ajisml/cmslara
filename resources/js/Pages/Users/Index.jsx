import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Pencil,
    Plus,
    Search,
    Trash2,
    UserCheck,
    UserCog,
    Users,
    UserX,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const defaultCreateData = {
    name: '',
    email: '',
    phone_number: '',
    gender: 'male',
    profile_photo: null,
    role: '',
    is_active: true,
    password: '',
    password_confirmation: '',
};

const defaultEditData = {
    _method: 'put',
    name: '',
    email: '',
    phone_number: '',
    gender: 'male',
    profile_photo: null,
    role: '',
    is_active: true,
    password: '',
    password_confirmation: '',
};

function genderLabel(value) {
    if (value === 'male') return 'Male';
    if (value === 'female') return 'Female';
    if (value === 'other') return 'Other';

    return '-';
}

function UserModal({
    title,
    open,
    onClose,
    form,
    onSubmit,
    submitLabel,
    existingPhotoUrl,
    roleOptions,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/35 p-4">
            <div className="surface-card w-full max-w-2xl p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ghost-btn h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Nama
                            </label>
                            <input
                                type="text"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                            {form.errors.name && (
                                <p className="mt-1 text-xs text-rose-500">{form.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                            {form.errors.email && (
                                <p className="mt-1 text-xs text-rose-500">{form.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Nomor HP
                            </label>
                            <input
                                type="text"
                                value={form.data.phone_number}
                                onChange={(event) => form.setData('phone_number', event.target.value)}
                                placeholder="08xxxxxxxxxx"
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                            {form.errors.phone_number && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {form.errors.phone_number}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Gender
                            </label>
                            <select
                                value={form.data.gender}
                                onChange={(event) => form.setData('gender', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            {form.errors.gender && (
                                <p className="mt-1 text-xs text-rose-500">{form.errors.gender}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Role
                            </label>
                            <select
                                value={form.data.role}
                                onChange={(event) => form.setData('role', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            >
                                {roleOptions.map((role) => (
                                    <option key={role.value} value={role.value}>
                                        {role.label}
                                    </option>
                                ))}
                            </select>
                            {form.errors.role && (
                                <p className="mt-1 text-xs text-rose-500">{form.errors.role}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Status
                            </label>
                            <select
                                value={form.data.is_active ? '1' : '0'}
                                onChange={(event) => form.setData('is_active', event.target.value === '1')}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            {form.errors.is_active && (
                                <p className="mt-1 text-xs text-rose-500">{form.errors.is_active}</p>
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Foto Profile
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    form.setData('profile_photo', event.target.files?.[0] ?? null)
                                }
                                className="w-full rounded-[0.625rem] border border-slate-300 bg-white text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white dark:border-border-dark dark:bg-slate-900/30"
                            />
                            {existingPhotoUrl && !form.data.profile_photo && (
                                <div className="mt-2 flex items-center gap-2">
                                    <img
                                        src={existingPhotoUrl}
                                        alt="Current profile"
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                        Foto saat ini
                                    </span>
                                </div>
                            )}
                            {form.data.profile_photo && (
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                    File terpilih: {form.data.profile_photo.name}
                                </p>
                            )}
                            {form.errors.profile_photo && (
                                <p className="mt-1 text-xs text-rose-500">
                                    {form.errors.profile_photo}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Password
                            </label>
                            <input
                                type="password"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                            {form.errors.password && (
                                <p className="mt-1 text-xs text-rose-500">{form.errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                Konfirmasi Password
                            </label>
                            <input
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData('password_confirmation', event.target.value)
                                }
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-[0.625rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
                        >
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UsersIndex({ users, filters, stats, roles }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [search, setSearch] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const createForm = useForm(defaultCreateData);
    const editForm = useForm(defaultEditData);
    const defaultRole = roles?.[0]?.value ?? 'editor';

    useEffect(() => {
        if (!createForm.data.role) {
            createForm.setData('role', defaultRole);
        }
    }, [defaultRole]);

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(
            route('users.index'),
            { search, role: roleFilter, status: statusFilter },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setRoleFilter('');
        setStatusFilter('');
        router.get(route('users.index'), {}, { preserveScroll: true, preserveState: true, replace: true });
    };

    const submitCreate = (event) => {
        event.preventDefault();
        createForm.post(route('users.store'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const openEdit = (user) => {
        setEditingUser(user);
        editForm.setData({
            ...defaultEditData,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number ?? '',
            gender: user.gender ?? 'male',
            role: user.role,
            is_active: user.is_active,
        });
        editForm.clearErrors();
        setEditOpen(true);
    };

    const submitEdit = (event) => {
        event.preventDefault();
        if (!editingUser) return;

        editForm.post(route('users.update', editingUser.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setEditOpen(false);
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const confirmDelete = async (user) => {
        const result = await Swal.fire({
            title: 'Hapus user?',
            text: `User ${user.name} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;

        router.delete(route('users.destroy', user.id), { preserveScroll: true });
    };

    const statCards = [
        { label: 'Total User', value: stats.total, icon: Users, color: 'text-primary' },
        { label: 'Active', value: stats.active, icon: UserCheck, color: 'text-emerald-500' },
        { label: 'Inactive', value: stats.inactive, icon: UserX, color: 'text-rose-500' },
        { label: 'Admin Level', value: stats.admin, icon: UserCog, color: 'text-amber-500' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Kelola User" />

            <section className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Kelola User
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kelola data user, role, status, nomor HP, gender, dan foto profile.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            createForm.reset();
                            createForm.setData('role', defaultRole);
                            createForm.clearErrors();
                            setCreateOpen(true);
                        }}
                        className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" /> Tambah User
                    </button>
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
                    <form onSubmit={applyFilters} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div className="relative md:col-span-2">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                type="text"
                                placeholder="Cari nama / email / nomor HP..."
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                        >
                            <option value="">Semua role</option>
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                        >
                            <option value="">Semua status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <div className="md:col-span-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="rounded-[0.625rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                className="rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                            >
                                Terapkan
                            </button>
                        </div>
                    </form>
                </section>

                <section className="surface-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-border-dark">
                            <thead className="bg-slate-50 dark:bg-slate-900/20">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nomor HP</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Gender</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Dibuat</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {user.profile_photo_url ? (
                                                    <img src={user.profile_photo_url} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                                                        {user.name.slice(0, 1).toUpperCase()}
                                                    </span>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{user.phone_number || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{genderLabel(user.gender)}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-200">{user.role}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{user.created_at}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <button type="button" onClick={() => openEdit(user)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => confirmDelete(user)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                            Data user tidak ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Menampilkan {users.from ?? 0} - {users.to ?? 0} dari {users.total} data
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {users.links.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
                                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors duration-200 ${link.active ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            </section>

            <UserModal
                title="Tambah User"
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                form={createForm}
                onSubmit={submitCreate}
                submitLabel="Simpan"
                existingPhotoUrl={null}
                roleOptions={roles}
            />

            <UserModal
                title={`Edit User${editingUser ? `: ${editingUser.name}` : ''}`}
                open={editOpen}
                onClose={() => {
                    setEditOpen(false);
                    setEditingUser(null);
                }}
                form={editForm}
                onSubmit={submitEdit}
                submitLabel="Perbarui"
                existingPhotoUrl={editingUser?.profile_photo_url ?? null}
                roleOptions={roles}
            />
        </AuthenticatedLayout>
    );
}
