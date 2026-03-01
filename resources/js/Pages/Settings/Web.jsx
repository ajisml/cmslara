import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';

function SectionTitle({ title, description }) {
    return (
        <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );
}

export default function WebSettings({ setting }) {
    const form = useForm({
        site_title: setting?.site_title ?? '',
        slogan: setting?.slogan ?? '',
        short_description: setting?.short_description ?? '',
        meta_description: setting?.meta_description ?? '',
        meta_keywords: setting?.meta_keywords ?? '',
        logo: null,
        icon: null,
        favicon: null,
        meta_thumbnail: null,
        contact_email: setting?.contact_email ?? '',
        contact_phone: setting?.contact_phone ?? '',
        whatsapp_number: setting?.whatsapp_number ?? '',
        address: setting?.address ?? '',
        city: setting?.city ?? '',
        province: setting?.province ?? '',
        country: setting?.country ?? '',
        postal_code: setting?.postal_code ?? '',
        google_maps_url: setting?.google_maps_url ?? '',
        facebook_url: setting?.facebook_url ?? '',
        instagram_url: setting?.instagram_url ?? '',
        youtube_url: setting?.youtube_url ?? '',
        tiktok_url: setting?.tiktok_url ?? '',
        x_url: setting?.x_url ?? '',
        linkedin_url: setting?.linkedin_url ?? '',
        threads_url: setting?.threads_url ?? '',
    });

    const submit = (event) => {
        event.preventDefault();

        form.post(route('web-settings.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    const previewMain = [
        ['Title', setting?.site_title],
        ['Slogan', setting?.slogan],
        ['Deskripsi Singkat', setting?.short_description],
        ['Meta Description', setting?.meta_description],
        ['Meta Keywords', setting?.meta_keywords],
    ].filter((item) => item[1]);

    const previewContact = [
        ['Email', setting?.contact_email],
        ['Phone', setting?.contact_phone],
        ['WhatsApp', setting?.whatsapp_number],
        ['Alamat', setting?.address],
        ['Kota', setting?.city],
        ['Provinsi', setting?.province],
        ['Negara', setting?.country],
        ['Kode Pos', setting?.postal_code],
        ['Google Maps', setting?.google_maps_url],
    ].filter((item) => item[1]);

    const previewSocials = [
        ['Facebook', setting?.facebook_url],
        ['Instagram', setting?.instagram_url],
        ['YouTube', setting?.youtube_url],
        ['TikTok', setting?.tiktok_url],
        ['X / Twitter', setting?.x_url],
        ['LinkedIn', setting?.linkedin_url],
        ['Threads', setting?.threads_url],
    ].filter((item) => item[1]);

    const previewImages = [
        ['Logo', setting?.logo_url],
        ['Icon', setting?.icon_url],
        ['Favicon', setting?.favicon_url],
        ['Meta Thumbnail', setting?.meta_thumbnail_url],
    ].filter((item) => item[1]);

    const hasPreview =
        previewMain.length > 0 ||
        previewContact.length > 0 ||
        previewSocials.length > 0 ||
        previewImages.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title="Web Settings" />

            <section className="space-y-6">
                <header>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Web Settings
                    </h1>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Atur branding, SEO, media sosial, kontak, dan metadata website.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <form onSubmit={submit} className="space-y-6 xl:col-span-2">
                        <section className="surface-card p-5 space-y-4">
                            <SectionTitle
                                title="Identitas Website"
                                description="Judul, slogan, dan deskripsi ringkas."
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Site Title
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.site_title}
                                        onChange={(event) => form.setData('site_title', event.target.value)}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Slogan
                                    </label>
                                    <input
                                        type="text"
                                        value={form.data.slogan}
                                        onChange={(event) => form.setData('slogan', event.target.value)}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Deskripsi Singkat
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.data.short_description}
                                        onChange={(event) => form.setData('short_description', event.target.value)}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="surface-card p-5 space-y-4">
                            <SectionTitle
                                title="SEO / Meta"
                                description="Pengaturan metadata untuk mesin pencari dan social preview."
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Meta Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.data.meta_description}
                                        onChange={(event) => form.setData('meta_description', event.target.value)}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                                        Meta Keywords
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="cms, laravel, berita, blog"
                                        value={form.data.meta_keywords}
                                        onChange={(event) => form.setData('meta_keywords', event.target.value)}
                                        className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="surface-card p-5 space-y-4">
                            <SectionTitle
                                title="Branding Assets"
                                description="Upload logo, icon, favicon, dan meta thumbnail."
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Logo</label>
                                    <input type="file" accept="image/*" onChange={(event) => form.setData('logo', event.target.files?.[0] ?? null)} className="w-full rounded-[0.625rem] border border-slate-300 bg-white text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Icon</label>
                                    <input type="file" accept="image/*" onChange={(event) => form.setData('icon', event.target.files?.[0] ?? null)} className="w-full rounded-[0.625rem] border border-slate-300 bg-white text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Favicon</label>
                                    <input type="file" accept=".ico,.png,.svg,.webp" onChange={(event) => form.setData('favicon', event.target.files?.[0] ?? null)} className="w-full rounded-[0.625rem] border border-slate-300 bg-white text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Meta Thumbnail</label>
                                    <input type="file" accept="image/*" onChange={(event) => form.setData('meta_thumbnail', event.target.files?.[0] ?? null)} className="w-full rounded-[0.625rem] border border-slate-300 bg-white text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-white dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                            </div>
                        </section>

                        <section className="surface-card p-5 space-y-4">
                            <SectionTitle
                                title="Kontak & Alamat"
                                description="Data ini bisa dipakai di footer / halaman kontak."
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
                                    <input type="email" value={form.data.contact_email} onChange={(event) => form.setData('contact_email', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Phone</label>
                                    <input type="text" value={form.data.contact_phone} onChange={(event) => form.setData('contact_phone', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">WhatsApp</label>
                                    <input type="text" value={form.data.whatsapp_number} onChange={(event) => form.setData('whatsapp_number', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Kode Pos</label>
                                    <input type="text" value={form.data.postal_code} onChange={(event) => form.setData('postal_code', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Alamat</label>
                                    <textarea rows={2} value={form.data.address} onChange={(event) => form.setData('address', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" />
                                </div>
                                <div><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Kota</label><input type="text" value={form.data.city} onChange={(event) => form.setData('city', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Provinsi</label><input type="text" value={form.data.province} onChange={(event) => form.setData('province', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Negara</label><input type="text" value={form.data.country} onChange={(event) => form.setData('country', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Google Maps URL</label><input type="url" value={form.data.google_maps_url} onChange={(event) => form.setData('google_maps_url', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                            </div>
                        </section>

                        <section className="surface-card p-5 space-y-4">
                            <SectionTitle
                                title="Media Sosial"
                                description="Isi link yang aktif saja. Kosongkan jika tidak dipakai."
                            />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Facebook</label><input type="url" value={form.data.facebook_url} onChange={(event) => form.setData('facebook_url', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Instagram</label><input type="url" value={form.data.instagram_url} onChange={(event) => form.setData('instagram_url', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">YouTube</label><input type="url" value={form.data.youtube_url} onChange={(event) => form.setData('youtube_url', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">TikTok</label><input type="url" value={form.data.tiktok_url} onChange={(event) => form.setData('tiktok_url', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">X / Twitter</label><input type="url" value={form.data.x_url} onChange={(event) => form.setData('x_url', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">LinkedIn</label><input type="url" value={form.data.linkedin_url} onChange={(event) => form.setData('linkedin_url', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                                <div className="sm:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Threads</label><input type="url" value={form.data.threads_url} onChange={(event) => form.setData('threads_url', event.target.value)} className="w-full rounded-[0.625rem] border-slate-300 bg-white text-sm shadow-sm focus:border-primary focus:ring-primary/30 dark:border-border-dark dark:bg-slate-900/30" /></div>
                            </div>
                        </section>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex items-center gap-2 rounded-[0.625rem] bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                Simpan Web Settings
                            </button>
                        </div>
                    </form>

                    <aside className="surface-card h-fit p-5 xl:sticky xl:top-24">
                        <SectionTitle
                            title="Preview Output"
                            description="Hanya data yang terisi yang akan ditampilkan."
                        />

                        {!hasPreview && (
                            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                Belum ada data yang terisi.
                            </p>
                        )}

                        {hasPreview && (
                            <div className="mt-4 space-y-4 text-sm">
                                {previewImages.length > 0 && (
                                    <div>
                                        <p className="mb-2 font-semibold text-slate-700 dark:text-slate-200">
                                            Branding
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {previewImages.map(([label, url]) => (
                                                <div key={label} className="rounded-md border border-slate-200 p-2 dark:border-border-dark">
                                                    <p className="mb-2 text-xs font-semibold uppercase text-slate-500">{label}</p>
                                                    <img src={url} alt={label} className="h-14 w-full object-contain" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {previewMain.length > 0 && (
                                    <div>
                                        <p className="mb-2 font-semibold text-slate-700 dark:text-slate-200">Informasi Utama</p>
                                        <ul className="space-y-1">
                                            {previewMain.map(([label, value]) => (
                                                <li key={label} className="text-slate-600 dark:text-slate-300">
                                                    <span className="font-medium">{label}:</span> {value}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {previewContact.length > 0 && (
                                    <div>
                                        <p className="mb-2 font-semibold text-slate-700 dark:text-slate-200">Kontak</p>
                                        <ul className="space-y-1">
                                            {previewContact.map(([label, value]) => (
                                                <li key={label} className="text-slate-600 dark:text-slate-300">
                                                    <span className="font-medium">{label}:</span> {value}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {previewSocials.length > 0 && (
                                    <div>
                                        <p className="mb-2 font-semibold text-slate-700 dark:text-slate-200">Media Sosial</p>
                                        <ul className="space-y-1">
                                            {previewSocials.map(([label, value]) => (
                                                <li key={label} className="text-slate-600 dark:text-slate-300">
                                                    <span className="font-medium">{label}:</span> {value}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </aside>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
