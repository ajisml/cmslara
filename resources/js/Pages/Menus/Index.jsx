import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FolderTreeItemWrapper, SortableTree } from 'dnd-kit-sortable-tree';
import { GripVertical, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const defaultMenuData = {
    title: '',
    url: '',
    target: '_self',
    icon: '',
    parent_id: '',
    is_active: true,
};

function flattenForOptions(tree, depth = 0, result = []) {
    tree.forEach((node) => {
        result.push({
            id: node.id,
            label: `${'-- '.repeat(depth)}${node.title}`,
        });
        flattenForOptions(node.children || [], depth + 1, result);
    });

    return result;
}

function serializeTree(tree, parentId = null, result = []) {
    tree.forEach((node, index) => {
        result.push({
            id: Number(node.id),
            parent_id: parentId === null ? null : Number(parentId),
            position: index,
        });

        serializeTree(node.children || [], node.id, result);
    });

    return result;
}

function findMenuById(tree, id) {
    for (const node of tree) {
        if (String(node.id) === String(id)) {
            return node;
        }

        const foundChild = findMenuById(node.children || [], id);
        if (foundChild) {
            return foundChild;
        }
    }

    return null;
}

function collectDescendantIds(node, ids = new Set()) {
    for (const child of node.children || []) {
        ids.add(String(child.id));
        collectDescendantIds(child, ids);
    }

    return ids;
}

export default function MenusIndex({ menuTree }) {
    const [menuItems, setMenuItems] = useState(menuTree || []);
    const [editingMenuId, setEditingMenuId] = useState(null);
    const menuForm = useForm(defaultMenuData);
    const reorderForm = useForm({ _method: 'put', items: [] });

    useEffect(() => {
        setMenuItems(menuTree || []);
    }, [menuTree]);

    const menuOptions = useMemo(() => flattenForOptions(menuItems), [menuItems]);
    const editingMenu = useMemo(
        () => (editingMenuId ? findMenuById(menuItems, editingMenuId) : null),
        [editingMenuId, menuItems],
    );

    const blockedParentIds = useMemo(() => {
        if (!editingMenu) return new Set();

        const ids = new Set([String(editingMenu.id)]);
        collectDescendantIds(editingMenu, ids);
        return ids;
    }, [editingMenu]);

    const resetForm = () => {
        setEditingMenuId(null);
        menuForm.reset();
        menuForm.setData('target', '_self');
        menuForm.setData('is_active', true);
        menuForm.clearErrors();
    };

    const startEdit = (id) => {
        const node = findMenuById(menuItems, id);
        if (!node) return;

        setEditingMenuId(node.id);
        menuForm.setData({
            title: node.title ?? '',
            url: node.url ?? '',
            target: node.target ?? '_self',
            icon: node.icon ?? '',
            parent_id: node.parent_id ?? '',
            is_active: Boolean(node.is_active),
        });
        menuForm.clearErrors();
    };

    const submitMenu = (event) => {
        event.preventDefault();
        const payload = {
            ...menuForm.data,
            parent_id: menuForm.data.parent_id || null,
        };

        if (editingMenuId) {
            menuForm
                .transform(() => ({ ...payload, _method: 'put' }))
                .post(route('menus.update', editingMenuId), {
                    preserveScroll: true,
                    onSuccess: resetForm,
                });
            return;
        }

        menuForm.transform(() => payload).post(route('menus.store'), {
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    const deleteMenu = async (id) => {
        const node = findMenuById(menuItems, id);
        if (!node) return;

        const result = await Swal.fire({
            title: 'Hapus menu?',
            text: `Menu ${node.title} akan dihapus.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;

        router.delete(route('menus.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                if (String(editingMenuId) === String(id)) {
                    resetForm();
                }
            },
        });
    };

    const handleItemsChanged = (newItems, reason) => {
        setMenuItems(newItems);

        if (reason.type === 'dropped') {
            Swal.fire({
                icon: 'success',
                title: 'Menu berhasil dipindahkan',
                toast: true,
                timer: 1200,
                showConfirmButton: false,
                position: 'top-end',
            });
        }
    };

    const saveOrder = () => {
        const items = serializeTree(menuItems);
        if (items.length === 0) return;

        reorderForm
            .transform(() => ({
                _method: 'put',
                items,
            }))
            .post(route('menus.reorder'), {
                preserveScroll: true,
            });
    };

    const MenuRow = useMemo(
        () =>
            forwardRef((props, ref) => {
                const item = props.item;
                const active = String(editingMenuId) === String(item.id);

                return (
                    <FolderTreeItemWrapper
                        {...props}
                        ref={ref}
                        manualDrag
                        showDragHandle={false}
                        className="!py-1"
                        contentClassName="!bg-transparent !border-0 !p-0"
                    >
                        <div
                            className={`flex items-center justify-between rounded-[0.625rem] border p-2 transition-colors ${
                                active
                                    ? 'border-primary bg-primary/5'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-border-dark dark:bg-slate-900/30 dark:hover:bg-slate-800/40'
                            }`}
                            onClick={() => startEdit(item.id)}
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <button
                                    type="button"
                                    {...props.handleProps}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800"
                                    title="Drag menu"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <GripVertical className="h-4 w-4" />
                                </button>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        {item.title}
                                    </p>
                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                        {item.url || '#'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {!item.is_active && (
                                    <span className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
                                        Inactive
                                    </span>
                                )}
                                {!!props.childCount && (
                                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        {props.childCount} submenu
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        startEdit(item.id);
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        deleteMenu(item.id);
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </FolderTreeItemWrapper>
                );
            }),
        [editingMenuId, menuItems],
    );

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Menu" />

            <section className="space-y-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Kelola Menu
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Drag item untuk ubah urutan. Geser horizontal saat drag untuk ubah level submenu.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={saveOrder}
                        className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                        <Save className="h-4 w-4" /> Simpan Urutan
                    </button>
                </header>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <section className="surface-card p-5 xl:col-span-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {editingMenuId ? 'Edit Menu' : 'Tambah Menu'}
                        </h2>
                        <form onSubmit={submitMenu} className="mt-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Judul menu"
                                value={menuForm.data.title}
                                onChange={(event) => menuForm.setData('title', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                            <input
                                type="text"
                                placeholder="URL (opsional)"
                                value={menuForm.data.url}
                                onChange={(event) => menuForm.setData('url', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                            <input
                                type="text"
                                placeholder="Icon (opsional)"
                                value={menuForm.data.icon}
                                onChange={(event) => menuForm.setData('icon', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            />
                            <select
                                value={menuForm.data.parent_id || ''}
                                onChange={(event) => menuForm.setData('parent_id', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            >
                                <option value="">Root Menu</option>
                                {menuOptions
                                    .filter((option) => !blockedParentIds.has(String(option.id)))
                                    .map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={menuForm.data.target}
                                onChange={(event) => menuForm.setData('target', event.target.value)}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            >
                                <option value="_self">Same Tab (_self)</option>
                                <option value="_blank">New Tab (_blank)</option>
                            </select>
                            <select
                                value={menuForm.data.is_active ? '1' : '0'}
                                onChange={(event) => menuForm.setData('is_active', event.target.value === '1')}
                                className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            <div className="flex justify-end gap-2">
                                {editingMenuId && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="rounded-[0.625rem] border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        Batal Edit
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    <Plus className="h-4 w-4" />
                                    {editingMenuId ? 'Perbarui Menu' : 'Simpan Menu'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="surface-card p-5 xl:col-span-2">
                        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                            Tree Menu (Library Drag & Drop)
                        </h2>
                        <div className="rounded-[0.625rem] border border-slate-200 p-3 dark:border-border-dark">
                            {menuItems.length === 0 ? (
                                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                                    Belum ada menu.
                                </p>
                            ) : (
                                <SortableTree
                                    items={menuItems}
                                    onItemsChanged={handleItemsChanged}
                                    TreeItemComponent={MenuRow}
                                    indentationWidth={28}
                                    keepGhostInPlace
                                    pointerSensorOptions={{
                                        activationConstraint: {
                                            distance: 3,
                                        },
                                    }}
                                />
                            )}
                        </div>

                        <div className="mt-6 rounded-[0.625rem] border border-slate-200 p-4 dark:border-border-dark">
                            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Preview Navbar
                            </p>
                            <div className="flex flex-wrap items-start gap-2">
                                {menuItems
                                    .filter((item) => item.is_active)
                                    .map((rootItem) => (
                                        <div
                                            key={rootItem.id}
                                            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 dark:border-border-dark dark:text-slate-200"
                                        >
                                            {rootItem.title}
                                            {(rootItem.children || []).length > 0 && (
                                                <span className="ml-2 text-xs text-slate-500">
                                                    ({rootItem.children.length} submenu)
                                                </span>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </section>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
