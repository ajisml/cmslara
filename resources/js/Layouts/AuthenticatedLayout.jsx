import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Bell,
    BookCopy,
    ChevronLeft,
    ChevronRight,
    FileClock,
    FolderKanban,
    GalleryHorizontal,
    Hash,
    Image,
    LayoutDashboard,
    ListTree,
    Mail,
    Menu,
    MenuSquare,
    Moon,
    PanelLeft,
    PanelTop,
    Search,
    Settings,
    Sun,
    User,
    Users,
    ShieldCheck,
    X,
    Globe,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useUiStore } from '@/stores/uiStore';

const sidebarMenu = [
    {
        group: 'Main',
        items: [
            {
                label: 'Dashboard',
                icon: LayoutDashboard,
                routeName: 'dashboard',
                active: ['dashboard'],
            },
        ],
    },
    {
        group: 'Post Blog',
        items: [
            {
                label: 'Kelola Postingan',
                icon: BookCopy,
                routeName: 'posts.index',
                active: ['posts.*'],
            },
            {
                label: 'Kelola Kategori',
                icon: FolderKanban,
                routeName: 'categories.index',
                active: ['categories.*'],
            },
            {
                label: 'Kelola Hastag',
                icon: Hash,
                routeName: 'hashtags.index',
                active: ['hashtags.*'],
            },
        ],
    },
    {
        group: 'Post Laman',
        items: [
            {
                label: 'Kelola Laman',
                icon: ListTree,
                routeName: 'pages.index',
                active: ['pages.*'],
            },
        ],
    },
    {
        group: 'Page Gallery',
        items: [
            {
                label: 'Kelola Gallery',
                icon: GalleryHorizontal,
                routeName: 'galleries.index',
                active: ['galleries.*'],
            },
            {
                label: 'Gambar Management',
                icon: Image,
                routeName: 'gallery-images.index',
                active: ['gallery-images.*'],
            },
        ],
    },
    {
        group: 'Users',
        items: [
            {
                label: 'Kelola User',
                icon: Users,
                routeName: 'users.index',
                active: ['users.*'],
            },
            {
                label: 'Role & Permission',
                icon: ShieldCheck,
                routeName: 'roles-permissions.index',
                active: ['roles-permissions.*', 'roles.*', 'permissions.*'],
            },
        ],
    },
    {
        group: 'Komunikasi',
        items: [
            {
                label: 'Kontak Masuk',
                icon: Mail,
                routeName: 'contact-messages.index',
                active: ['contact-messages.*'],
                allowedRoles: ['superadmin', 'admin'],
            },
        ],
    },
    {
        group: 'Menu',
        items: [
            {
                label: 'Kelola Menu',
                icon: MenuSquare,
                routeName: 'menus.index',
                active: ['menus.*'],
            },
        ],
    },
    {
        group: 'Settings',
        items: [
            {
                label: 'Web Settings',
                icon: Globe,
                routeName: 'web-settings.edit',
                active: ['web-settings.*'],
            },
            {
                label: 'Kelola Notif',
                icon: Bell,
                routeName: 'notifications.index',
                active: ['notifications.*'],
                superadminOnly: true,
            },
            {
                label: 'Audit Log',
                icon: FileClock,
                routeName: 'audit-logs.index',
                active: ['audit-logs.*'],
                superadminOnly: true,
            },
        ],
    },
];

const topNavItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        routeName: 'dashboard',
        active: ['dashboard'],
    },
    {
        label: 'Post Blog',
        icon: BookCopy,
        routeName: 'posts.index',
        active: ['posts.*', 'categories.*', 'hashtags.*'],
    },
    {
        label: 'Post Laman',
        icon: ListTree,
        routeName: 'pages.index',
        active: ['pages.*'],
    },
    {
        label: 'Page Gallery',
        icon: GalleryHorizontal,
        routeName: 'galleries.index',
        active: ['galleries.*', 'gallery-images.*'],
    },
    {
        label: 'Users',
        icon: Users,
        routeName: 'users.index',
        active: ['users.*'],
    },
    {
        label: 'Kontak',
        icon: Mail,
        routeName: 'contact-messages.index',
        active: ['contact-messages.*'],
        allowedRoles: ['superadmin', 'admin'],
    },
    {
        label: 'Menu',
        icon: MenuSquare,
        routeName: 'menus.index',
        active: ['menus.*'],
    },
    {
        label: 'Settings',
        icon: Globe,
        routeName: 'web-settings.edit',
        active: ['web-settings.*', 'notifications.*', 'audit-logs.*'],
    },
    {
        label: 'Notifikasi',
        icon: Bell,
        routeName: 'notifications.index',
        active: ['notifications.*'],
        superadminOnly: true,
    },
    {
        label: 'Audit Log',
        icon: FileClock,
        routeName: 'audit-logs.index',
        active: ['audit-logs.*'],
        superadminOnly: true,
    },
];

function isActive(item) {
    if (!item.active) {
        return false;
    }

    return item.active.some((pattern) => route().current(pattern));
}

function canAccessMenuItem(item, user) {
    if (item.superadminOnly) {
        return user?.role === 'superadmin';
    }

    if (Array.isArray(item.allowedRoles) && item.allowedRoles.length > 0) {
        return item.allowedRoles.includes(user?.role);
    }

    return true;
}

function showComingSoon(feature) {
    Swal.fire({
        title: 'Coming Soon',
        text: `Fitur "${feature}" akan kita implementasikan berikutnya.`,
        icon: 'info',
        confirmButtonColor: '#1f9cef',
    });
}

function MenuItem({ item, compact = false, onSelect }) {
    const Icon = item.icon;
    const active = isActive(item);

    const classes = `menu-item ${active ? 'menu-item-active' : ''} ${
        compact ? 'justify-center' : 'justify-start'
    }`;

    if (item.routeName) {
        return (
            <Link
                href={route(item.routeName)}
                className={classes}
                title={item.label}
                onClick={() => onSelect?.()}
            >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span
                    className={`truncate transition-all duration-200 ${
                        compact ? 'w-0 opacity-0' : 'opacity-100'
                    }`}
                >
                    {item.label}
                </span>
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={() => {
                showComingSoon(item.label);
                onSelect?.();
            }}
            className={classes}
            title={item.label}
        >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span
                className={`truncate transition-all duration-200 ${
                    compact ? 'w-0 opacity-0' : 'opacity-100'
                }`}
            >
                {item.label}
            </span>
        </button>
    );
}

export default function AuthenticatedLayout({ children }) {
    const page = usePage();
    const pageProps = page.props;
    const user = pageProps.auth.user;
    const flash = pageProps.flash;
    const webSetting = pageProps.webSetting;
    const headerNotifications = pageProps.headerNotifications;

    const navMode = useUiStore((state) => state.navMode);
    const sidebarOpen = useUiStore((state) => state.sidebarOpen);
    const darkMode = useUiStore((state) => state.darkMode);
    const setNavMode = useUiStore((state) => state.setNavMode);
    const toggleSidebar = useUiStore((state) => state.toggleSidebar);
    const toggleDarkMode = useUiStore((state) => state.toggleDarkMode);

    const [notificationOpen, setNotificationOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const profileInitial = useMemo(
        () => (user?.name ? user.name.slice(0, 1).toUpperCase() : 'A'),
        [user?.name],
    );

    const appTitle = webSetting?.site_title || 'CMS Admin';
    const currentYear = new Date().getFullYear();
    const canManageNotifications = user?.role === 'superadmin';
    const notificationItems = headerNotifications?.items ?? [];
    const notificationCount = Number(headerNotifications?.total ?? 0);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
        const faviconHref = webSetting?.favicon_url || '/favicon.ico';
        let link = document.querySelector("link[rel='icon']");

        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'icon');
            document.head.appendChild(link);
        }

        link.setAttribute('href', faviconHref);
    }, [webSetting?.favicon_url]);

    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                title: 'Sukses',
                text: flash.success,
                icon: 'success',
                timer: 1800,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        }

        if (flash?.error) {
            Swal.fire({
                title: 'Gagal',
                text: flash.error,
                icon: 'error',
                timer: 2400,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
            });
        }
    }, [flash?.error, flash?.success]);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [page.url]);

    useEffect(() => {
        if (!mobileNavOpen) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileNavOpen]);

    useEffect(() => {
        const onOutsideClick = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setNotificationOpen(false);
            }

            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        const onEscape = (event) => {
            if (event.key === 'Escape') {
                setNotificationOpen(false);
                setProfileOpen(false);
                setMobileNavOpen(false);
            }
        };

        document.addEventListener('mousedown', onOutsideClick);
        document.addEventListener('keydown', onEscape);

        return () => {
            document.removeEventListener('mousedown', onOutsideClick);
            document.removeEventListener('keydown', onEscape);
        };
    }, []);

    const leftPaddingClass =
        navMode === 'sidebar'
            ? sidebarOpen
                ? 'md:pl-72'
                : 'md:pl-[92px]'
            : '';

    return (
        <div className="min-h-screen bg-page transition-colors duration-300 dark:bg-page-dark">
            <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur transition-colors duration-300 dark:border-border-dark dark:bg-sidebar-dark/90">
                <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                            type="button"
                            className="ghost-btn md:hidden"
                            onClick={() => setMobileNavOpen(true)}
                            title="Open navigation"
                        >
                            <Menu className="h-[18px] w-[18px]" />
                        </button>
                        <Link
                            href={route('dashboard')}
                            className="hidden items-center gap-2 md:flex"
                        >
                            {webSetting?.logo_url && (
                                <img
                                    src={webSetting.logo_url}
                                    alt={appTitle}
                                    className="h-8 w-8 rounded-md object-contain"
                                />
                            )}
                            <span className="truncate text-xl font-extrabold tracking-tight text-primary">
                                {appTitle}
                            </span>
                        </Link>
                        <div className="relative w-full max-w-md">
                            <span className="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-400 dark:text-slate-500">
                                <Search className="h-[18px] w-[18px]" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="h-10 w-full rounded-[0.625rem] border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 dark:border-border-dark dark:bg-card-dark dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-card-dark"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden items-center rounded-[0.625rem] border border-slate-200 bg-white p-1 shadow-[0_1px_6px_rgba(15,23,42,0.04)] transition-colors duration-300 dark:border-border-dark dark:bg-card-dark sm:flex">
                            <button
                                type="button"
                                onClick={() => setNavMode('sidebar')}
                                className={`h-8 w-8 rounded-md transition-all duration-200 ${
                                    navMode === 'sidebar'
                                        ? 'bg-primary text-white'
                                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                                title="Sidebar mode"
                            >
                                <PanelLeft className="mx-auto h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setNavMode('topnav')}
                                className={`h-8 w-8 rounded-md transition-all duration-200 ${
                                    navMode === 'topnav'
                                        ? 'bg-primary text-white'
                                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                                title="Top navigation mode"
                            >
                                <PanelTop className="mx-auto h-4 w-4" />
                            </button>
                        </div>

                        <button
                            type="button"
                            className="ghost-btn relative overflow-hidden"
                            onClick={toggleDarkMode}
                            title="Toggle dark mode"
                        >
                            <span className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
                            {darkMode ? (
                                <Sun className="relative h-[17px] w-[17px] text-amber-400" />
                            ) : (
                                <Moon className="relative h-[17px] w-[17px]" />
                            )}
                        </button>

                        <div className="relative" ref={notificationRef}>
                            <button
                                type="button"
                                className="ghost-btn relative"
                                onClick={() => {
                                    setNotificationOpen((state) => !state);
                                    setProfileOpen(false);
                                }}
                                title="Notifications"
                            >
                                <Bell className="h-[17px] w-[17px]" />
                                {notificationCount > 0 && (
                                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-card-dark" />
                                )}
                            </button>

                            {notificationOpen && (
                                <div className="absolute right-0 top-12 z-50 w-80 rounded-[0.625rem] border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-colors duration-300 dark:border-border-dark dark:bg-card-dark">
                                    <div className="px-3 pb-2 pt-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            Notifikasi Terbaru
                                        </p>
                                    </div>
                                    <ul className="space-y-1">
                                        {notificationItems.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setNotificationOpen(false);

                                                        if (item.link_url) {
                                                            window.location.assign(item.link_url);
                                                            return;
                                                        }

                                                        if (canManageNotifications) {
                                                            router.visit(route('notifications.index'));
                                                        }
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <span
                                                        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800/80 ${
                                                            item.type === 'success'
                                                                ? 'text-emerald-500'
                                                                : item.type === 'warning'
                                                                  ? 'text-amber-500'
                                                                  : item.type === 'danger'
                                                                    ? 'text-rose-500'
                                                                    : 'text-sky-500'
                                                        }`}
                                                    >
                                                        <Activity className="h-4 w-4" />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm text-slate-700 dark:text-slate-100">
                                                            {item.title}
                                                        </span>
                                                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                                                            {item.time ?? '-'}
                                                        </span>
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                        {notificationItems.length === 0 && (
                                            <li className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                Belum ada notifikasi.
                                            </li>
                                        )}
                                    </ul>
                                    <div className="mt-1 border-t border-slate-200 pt-2 dark:border-border-dark">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNotificationOpen(false);
                                                if (canManageNotifications) {
                                                    router.visit(route('notifications.index'));
                                                    return;
                                                }
                                                router.visit(route('dashboard'));
                                            }}
                                            className="w-full rounded-md px-3 py-2 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary/10"
                                        >
                                            Lihat semua
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative" ref={profileRef}>
                            <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white shadow-[0_2px_8px_rgba(24,148,237,0.25)] transition-transform duration-200 hover:scale-[1.03]"
                                onClick={() => {
                                    setProfileOpen((state) => !state);
                                    setNotificationOpen(false);
                                }}
                                title="Profile"
                            >
                                {user?.profile_photo_url ? (
                                    <img
                                        src={user.profile_photo_url}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    profileInitial
                                )}
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 top-12 z-50 w-56 rounded-[0.625rem] border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-colors duration-300 dark:border-border-dark dark:bg-card-dark">
                                    <ul className="space-y-1">
                                        <li>
                                            <Link
                                                href={route('profile.edit')}
                                                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                <User className="h-4 w-4" /> Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => showComingSoon('Histrory Login')}
                                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                <Activity className="h-4 w-4" /> Histrory
                                                Login
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => showComingSoon('Aktivity')}
                                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                            >
                                                <Settings className="h-4 w-4" /> Aktivity
                                            </button>
                                        </li>
                                        <li>
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-rose-600 transition-colors duration-200 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                                            >
                                                <ChevronRight className="h-4 w-4" /> Logout
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div
                className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity duration-300 md:hidden ${
                    mobileNavOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={() => setMobileNavOpen(false)}
                aria-hidden
            />

            <aside
                className={`fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col overflow-hidden border-r border-slate-200 bg-white/95 px-3 pb-4 pt-4 shadow-[0_2px_12px_rgba(15,23,42,0.16)] transition-all duration-300 dark:border-border-dark dark:bg-sidebar-dark/95 md:hidden ${
                    mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="mb-4 flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="truncate text-base font-extrabold tracking-tight text-primary">
                            {appTitle}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Navigation
                        </p>
                    </div>
                    <button
                        type="button"
                        className="ghost-btn h-8 w-8"
                        onClick={() => setMobileNavOpen(false)}
                        title="Close navigation"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mb-4 flex items-center rounded-[0.625rem] border border-slate-200 bg-white p-1 dark:border-border-dark dark:bg-card-dark">
                    <button
                        type="button"
                        onClick={() => setNavMode('sidebar')}
                        className={`h-8 flex-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                            navMode === 'sidebar'
                                ? 'bg-primary text-white'
                                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        Sidebar
                    </button>
                    <button
                        type="button"
                        onClick={() => setNavMode('topnav')}
                        className={`h-8 flex-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                            navMode === 'topnav'
                                ? 'bg-primary text-white'
                                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        Top Nav
                    </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-6">
                    {sidebarMenu.map((section) => (
                        <div key={section.group}>
                            {section.items.filter((item) => canAccessMenuItem(item, user))
                                .length > 0 && (
                                <>
                                <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                    {section.group}
                                </p>
                                <div className="space-y-1">
                                    {section.items
                                        .filter((item) => canAccessMenuItem(item, user))
                                        .map((item) => (
                                            <MenuItem
                                                key={item.label}
                                                item={item}
                                                onSelect={() => setMobileNavOpen(false)}
                                            />
                                        ))}
                                </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {navMode === 'sidebar' && (
                <aside
                    className={`fixed bottom-0 left-0 top-16 z-30 hidden flex-col overflow-hidden border-r border-slate-200 bg-white/95 px-3 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 dark:border-border-dark dark:bg-sidebar-dark/95 md:flex ${
                        sidebarOpen ? 'w-64' : 'w-[70px]'
                    }`}
                >
                    <div
                        className={`mb-5 flex items-center ${
                            sidebarOpen ? 'justify-between' : 'justify-center'
                        }`}
                    >
                        <span
                            className={`truncate text-sm font-bold tracking-wide text-primary transition-all duration-300 ${
                                sidebarOpen ? 'opacity-100' : 'w-0 opacity-0'
                            }`}
                        >
                            NAVIGATION
                        </span>
                        <button
                            type="button"
                            className="ghost-btn h-8 w-8"
                            onClick={toggleSidebar}
                            title="Toggle sidebar"
                        >
                            <ChevronLeft
                                className={`h-4 w-4 transition-transform duration-300 ${
                                    sidebarOpen ? 'rotate-0' : 'rotate-180'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-6">
                        {sidebarMenu.map((section) => (
                            <div key={section.group}>
                                {section.items.filter((item) => canAccessMenuItem(item, user))
                                    .length > 0 && (
                                    <>
                                        <p
                                            className={`mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 transition-all duration-200 dark:text-slate-500 ${
                                                sidebarOpen ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        >
                                            {section.group}
                                        </p>
                                        <div className="space-y-1">
                                            {section.items
                                                .filter((item) =>
                                                    canAccessMenuItem(item, user),
                                                )
                                                .map((item) => (
                                                    <MenuItem
                                                        key={item.label}
                                                        item={item}
                                                        compact={!sidebarOpen}
                                                    />
                                                ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </aside>
            )}

            <div className="pt-16">
                {navMode === 'topnav' && (
                    <nav className="sticky top-16 z-20 hidden border-b border-slate-200 bg-white/90 px-4 backdrop-blur transition-colors duration-300 dark:border-border-dark dark:bg-sidebar-dark/90 md:block sm:px-6">
                        <div className="mx-auto flex h-14 w-full max-w-[1800px] items-end gap-1 overflow-x-auto">
                            {topNavItems
                                .filter((item) => canAccessMenuItem(item, user))
                                .map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item);

                                if (item.routeName) {
                                    return (
                                        <Link
                                            key={item.label}
                                            href={route(item.routeName)}
                                            className={`flex h-full shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-semibold transition-all duration-200 ${
                                                active
                                                    ? 'border-primary text-primary'
                                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                }

                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => showComingSoon(item.label)}
                                        className="flex h-full shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-semibold text-slate-500 transition-all duration-200 hover:border-slate-300 hover:text-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-100"
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </button>
                                );
                                })}
                        </div>
                    </nav>
                )}

                <main
                    className={`mx-auto w-full max-w-[1800px] px-4 pb-10 pt-6 transition-all duration-300 sm:px-6 ${leftPaddingClass}`}
                >
                    {children}
                </main>

                <footer
                    className={`mx-auto w-full max-w-[1800px] px-4 pb-6 transition-all duration-300 sm:px-6 ${leftPaddingClass}`}
                >
                    <div className="rounded-[0.625rem] border border-slate-200 bg-white/70 px-4 py-3 text-xs text-slate-500 transition-colors duration-300 dark:border-border-dark dark:bg-card-dark/70 dark:text-slate-400">
                        <p className="text-center sm:text-left">
                            &copy; {currentYear} {appTitle}. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
