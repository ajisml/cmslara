import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { KeyRound, Pencil, Plus, Search, ShieldCheck, ShieldPlus, Trash2, UserCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const baseRoleData = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
};

const basePermissionData = {
    name: '',
    slug: '',
    group_name: 'general',
    description: '',
};

export default function RolePermissionsIndex({
    roles,
    permissions,
    permissionGroups,
    selectedRole,
    roleOptions,
    permissionGroupOptions,
    filters,
    stats,
}) {
    const [roleSearch, setRoleSearch] = useState(filters.role_search ?? '');
    const [permissionSearch, setPermissionSearch] = useState(filters.permission_search ?? '');
    const [permissionGroup, setPermissionGroup] = useState(filters.permission_group ?? '');
    const [selectedRoleId, setSelectedRoleId] = useState(filters.selected_role_id ?? '');

    const [editingRole, setEditingRole] = useState(null);
    const [editingPermission, setEditingPermission] = useState(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

    const roleForm = useForm(baseRoleData);
    const permissionForm = useForm(basePermissionData);
    const syncPermissionForm = useForm({ _method: 'put', permission_ids: [] });

    useEffect(() => {
        setSelectedRoleId(selectedRole?.id ?? '');
        setSelectedPermissionIds(selectedRole?.permission_ids ?? []);
    }, [selectedRole?.id]);

    const statCards = [
        { label: 'Total Roles', value: stats.roles, icon: ShieldCheck, color: 'text-primary' },
        { label: 'Total Permissions', value: stats.permissions, icon: KeyRound, color: 'text-emerald-500' },
        { label: 'Mapping Role-Permission', value: stats.mapped, icon: ShieldPlus, color: 'text-amber-500' },
        { label: 'User Dengan Role Valid', value: stats.users_with_known_role, icon: UserCheck, color: 'text-sky-500' },
    ];

    const queryParams = useMemo(
        () => ({
            role_search: roleSearch,
            permission_search: permissionSearch,
            permission_group: permissionGroup,
            selected_role_id: selectedRoleId || undefined,
        }),
        [permissionGroup, permissionSearch, roleSearch, selectedRoleId],
    );

    const applyRoleSearch = (event) => {
        event.preventDefault();
        router.get(route('roles-permissions.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const applyPermissionFilters = (event) => {
        event.preventDefault();
        router.get(route('roles-permissions.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const openEditRole = (role) => {
        setEditingRole(role);
        roleForm.setData({
            name: role.name,
            slug: role.slug,
            description: role.description ?? '',
            is_active: role.is_active,
        });
        roleForm.clearErrors();
    };

    const openEditPermission = (permission) => {
        setEditingPermission(permission);
        permissionForm.setData({
            name: permission.name,
            slug: permission.slug,
            group_name: permission.group_name,
            description: permission.description ?? '',
        });
        permissionForm.clearErrors();
    };

    const resetRoleForm = () => {
        setEditingRole(null);
        roleForm.reset();
        roleForm.setData('is_active', true);
        roleForm.clearErrors();
    };

    const resetPermissionForm = () => {
        setEditingPermission(null);
        permissionForm.reset();
        permissionForm.setData('group_name', 'general');
        permissionForm.clearErrors();
    };
    const submitRole = (event) => {
        event.preventDefault();

        if (editingRole) {
            roleForm.transform((data) => ({ ...data, _method: 'put' })).post(route('roles.update', editingRole.id), {
                preserveScroll: true,
                onSuccess: () => resetRoleForm(),
            });
            return;
        }

        roleForm.post(route('roles.store'), {
            preserveScroll: true,
            onSuccess: () => resetRoleForm(),
        });
    };

    const submitPermission = (event) => {
        event.preventDefault();

        if (editingPermission) {
            permissionForm
                .transform((data) => ({ ...data, _method: 'put' }))
                .post(route('permissions.update', editingPermission.id), {
                    preserveScroll: true,
                    onSuccess: () => resetPermissionForm(),
                });
            return;
        }

        permissionForm.post(route('permissions.store'), {
            preserveScroll: true,
            onSuccess: () => resetPermissionForm(),
        });
    };

    const deleteRole = async (role) => {
        const result = await Swal.fire({
            title: 'Hapus role?',
            text: `Role ${role.name} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (result.isConfirmed) {
            router.delete(route('roles.destroy', role.id), { preserveScroll: true });
        }
    };

    const deletePermission = async (permission) => {
        const result = await Swal.fire({
            title: 'Hapus permission?',
            text: `Permission ${permission.name} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (result.isConfirmed) {
            router.delete(route('permissions.destroy', permission.id), { preserveScroll: true });
        }
    };

    const changeSelectedRole = (value) => {
        setSelectedRoleId(value);
        router.get(route('roles-permissions.index'), { ...queryParams, selected_role_id: value || undefined }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const togglePermission = (permissionId) => {
        setSelectedPermissionIds((current) =>
            current.includes(permissionId)
                ? current.filter((item) => item !== permissionId)
                : [...current, permissionId],
        );
    };

    const submitMapping = (event) => {
        event.preventDefault();
        if (!selectedRole?.id) return;

        syncPermissionForm.transform(() => ({ _method: 'put', permission_ids: selectedPermissionIds }))
            .post(route('roles.permissions.sync', selectedRole.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Role & Permission" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Role & Permission</h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        CRUD role, CRUD permission, dan mapping permission per role.
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section className="surface-card p-5">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingRole ? 'Edit Role' : 'Tambah Role'}</h2>
                        <form onSubmit={submitRole} className="mt-4 space-y-3">
                            <input type="text" placeholder="Nama role" value={roleForm.data.name} onChange={(e) => roleForm.setData('name', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <input type="text" placeholder="Slug (opsional)" value={roleForm.data.slug} onChange={(e) => roleForm.setData('slug', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <textarea rows={3} placeholder="Deskripsi" value={roleForm.data.description} onChange={(e) => roleForm.setData('description', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <select value={roleForm.data.is_active ? '1' : '0'} onChange={(e) => roleForm.setData('is_active', e.target.value === '1')} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30">
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            <div className="flex justify-end gap-2">
                                {editingRole && <button type="button" onClick={resetRoleForm} className="rounded-[0.625rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800">Batal Edit</button>}
                                <button type="submit" className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><Plus className="h-4 w-4" />{editingRole ? 'Perbarui Role' : 'Simpan Role'}</button>
                            </div>
                        </form>
                    </section>

                    <section className="surface-card p-5">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editingPermission ? 'Edit Permission' : 'Tambah Permission'}</h2>
                        <form onSubmit={submitPermission} className="mt-4 space-y-3">
                            <input type="text" placeholder="Nama permission" value={permissionForm.data.name} onChange={(e) => permissionForm.setData('name', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <input type="text" placeholder="Slug (opsional)" value={permissionForm.data.slug} onChange={(e) => permissionForm.setData('slug', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <input type="text" placeholder="Group (contoh: users)" value={permissionForm.data.group_name} onChange={(e) => permissionForm.setData('group_name', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <textarea rows={3} placeholder="Deskripsi" value={permissionForm.data.description} onChange={(e) => permissionForm.setData('description', e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            <div className="flex justify-end gap-2">
                                {editingPermission && <button type="button" onClick={resetPermissionForm} className="rounded-[0.625rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800">Batal Edit</button>}
                                <button type="submit" className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"><Plus className="h-4 w-4" />{editingPermission ? 'Perbarui Permission' : 'Simpan Permission'}</button>
                            </div>
                        </form>
                    </section>
                </div>
                <section className="surface-card p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mapping Permission Ke Role</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Pilih role lalu centang permission yang diizinkan.</p>
                        </div>
                        <div className="w-full sm:w-72">
                            <select value={selectedRoleId || ''} onChange={(e) => changeSelectedRole(e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30">
                                <option value="">Pilih role</option>
                                {roleOptions.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name} ({role.slug})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {!selectedRole && <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada role dipilih.</p>}
                    {selectedRole && (
                        <form onSubmit={submitMapping} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {permissionGroups.map((groupItem) => (
                                    <div key={groupItem.group} className="rounded-[0.625rem] border border-slate-200 p-4 dark:border-border-dark">
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{groupItem.group}</p>
                                        <div className="space-y-1">
                                            {groupItem.permissions.map((permission) => (
                                                <label key={permission.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                                                    <input type="checkbox" checked={selectedPermissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} className="rounded border-slate-300 text-primary shadow-sm focus:ring-primary/30" />
                                                    <span>{permission.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90">Simpan Mapping Permission</button>
                            </div>
                        </form>
                    )}
                </section>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section className="surface-card overflow-hidden">
                        <form onSubmit={applyRoleSearch} className="border-b border-slate-200 p-4 dark:border-border-dark">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={roleSearch} onChange={(e) => setRoleSearch(e.target.value)} placeholder="Cari role..." className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            </div>
                        </form>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-border-dark">
                                <thead className="bg-slate-50 dark:bg-slate-900/20">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Stats</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                    {roles.data.map((role) => (
                                        <tr key={role.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                            <td className="px-4 py-3"><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{role.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{role.slug}</p></td>
                                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400"><p>{role.users_count} user</p><p>{role.permissions_count} permission</p></td>
                                            <td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" onClick={() => openEditRole(role)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deleteRole(role)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                            {roles.links.map((link) => (
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
                    </section>

                    <section className="surface-card overflow-hidden">
                        <form onSubmit={applyPermissionFilters} className="grid grid-cols-1 gap-2 border-b border-slate-200 p-4 dark:border-border-dark sm:grid-cols-3">
                            <div className="relative sm:col-span-2">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input type="text" value={permissionSearch} onChange={(e) => setPermissionSearch(e.target.value)} placeholder="Cari permission..." className="w-full rounded-[0.625rem] border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                            </div>
                            <select value={permissionGroup} onChange={(e) => setPermissionGroup(e.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30">
                                <option value="">Semua group</option>
                                {permissionGroupOptions.map((groupName) => (<option key={groupName} value={groupName}>{groupName}</option>))}
                            </select>
                        </form>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-border-dark">
                                <thead className="bg-slate-50 dark:bg-slate-900/20"><tr><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Permission</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Group</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th></tr></thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
                                    {permissions.data.map((permission) => (
                                        <tr key={permission.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                                            <td className="px-4 py-3"><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{permission.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{permission.slug}</p></td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{permission.group_name}</td>
                                            <td className="px-4 py-3"><div className="flex justify-end gap-1"><button type="button" onClick={() => openEditPermission(permission)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => deletePermission(permission)} className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1 border-t border-slate-200 px-4 py-3 dark:border-border-dark">
                            {permissions.links.map((link) => (
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
                    </section>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
