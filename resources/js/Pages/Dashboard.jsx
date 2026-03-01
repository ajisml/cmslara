import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    CircleAlert,
    FilePlus2,
    FileText,
    Images,
    MessageSquare,
    Upload,
    UserPlus,
    Users,
} from 'lucide-react';

const activities = [
    {
        icon: FilePlus2,
        title: "New page 'About Us' published",
        timestamp: '2 min ago',
        color: 'text-sky-500',
    },
    {
        icon: UserPlus,
        title: 'User john@email.com registered',
        timestamp: '15 min ago',
        color: 'text-emerald-500',
    },
    {
        icon: Upload,
        title: "Media file 'banner.jpg' uploaded",
        timestamp: '1 hour ago',
        color: 'text-amber-500',
    },
    {
        icon: CircleAlert,
        title: 'Settings updated by admin',
        timestamp: '3 hours ago',
        color: 'text-rose-500',
    },
];

function StatCard({ icon: Icon, value, label, delta }) {
    return (
        <article className="surface-card p-5">
            <div className="mb-5 flex items-start justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-[0.625rem] bg-primary/15 text-primary">
                    <Icon size={20} />
                </span>
                <span className="text-sm font-semibold text-emerald-500">{delta}</span>
            </div>
            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {value}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </article>
    );
}

export default function Dashboard({ stats }) {
    const statCards = [
        {
            icon: FileText,
            value: '124',
            label: 'Total Pages',
            delta: '+12%',
        },
        {
            icon: Users,
            value: stats.activeUsers.toLocaleString(),
            label: 'Active Users',
            delta: '+8.2%',
        },
        {
            icon: MessageSquare,
            value: '96',
            label: 'Messages',
            delta: '+15%',
        },
        {
            icon: Images,
            value: stats.totalUsers.toLocaleString(),
            label: 'Registered Users',
            delta: '+3.1%',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Welcome back! Here is your overview.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card) => (
                        <StatCard key={card.label} {...card} />
                    ))}
                </div>

                <section className="surface-card p-6">
                    <header className="mb-5">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Recent Activity
                        </h3>
                    </header>
                    <ul className="divide-y divide-slate-200 dark:divide-border-dark">
                        {activities.map((activity) => {
                            const Icon = activity.icon;

                            return (
                                <li
                                    key={activity.title}
                                    className="flex items-center justify-between gap-4 py-4"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.625rem] bg-slate-100 dark:bg-slate-800/80 ${activity.color}`}
                                        >
                                            <Icon size={18} />
                                        </span>
                                        <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {activity.title}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {activity.timestamp}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </section>
        </AuthenticatedLayout>
    );
}
