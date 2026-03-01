import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, MailOpen, ShieldAlert, Trash2, Undo2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ContactMessagesShow({ message }) {
    const markUnread = () => {
        router.put(
            route('contact-messages.mark-unread', message.id),
            {},
            { preserveScroll: true },
        );
    };

    const deleteItem = async () => {
        const result = await Swal.fire({
            title: 'Hapus kontak masuk?',
            text: `Data dari ${message.name} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#ef4444',
        });

        if (!result.isConfirmed) return;

        router.delete(route('contact-messages.destroy', message.id), {
            onSuccess: () => {
                router.visit(route('contact-messages.index'));
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Kontak - ${message.name}`} />

            <section className="space-y-6">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Detail Kontak Masuk
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Informasi lengkap pesan kontak dari pengunjung laman.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('contact-messages.index')}
                            className="inline-flex items-center gap-2 rounded-[0.625rem] border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-border-dark dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </Link>
                        <button
                            type="button"
                            onClick={markUnread}
                            className="inline-flex items-center gap-2 rounded-[0.625rem] border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-300 dark:hover:bg-amber-500/10"
                        >
                            <Undo2 className="h-4 w-4" /> Tandai Belum Dibaca
                        </button>
                        <button
                            type="button"
                            onClick={deleteItem}
                            className="inline-flex items-center gap-2 rounded-[0.625rem] border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                            <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                    </div>
                </header>

                <article className="surface-card p-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Nama
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                {message.name}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Email
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                {message.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                No. HP
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                {message.phone_number}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Status
                            </p>
                            <p
                                className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                                    message.is_read
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                }`}
                            >
                                <MailOpen className="h-3.5 w-3.5" />
                                {message.is_read ? 'Sudah dibaca' : 'Belum dibaca'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Waktu Masuk
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                                {message.created_at}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Dibaca Pada
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                                {message.read_at || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                IP Address
                            </p>
                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                                {message.ip_address || '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Source URL
                            </p>
                            <p className="mt-1 break-all text-sm text-slate-700 dark:text-slate-200">
                                {message.source_url || '-'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[0.625rem] border border-slate-200 bg-slate-50 p-4 dark:border-border-dark dark:bg-slate-900/20">
                        <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <ShieldAlert className="h-3.5 w-3.5" /> Isi Pesan
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                            {message.message}
                        </p>
                    </div>
                </article>
            </section>
        </AuthenticatedLayout>
    );
}
