<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Superadmin',
                'slug' => 'superadmin',
                'description' => 'Akses penuh ke seluruh modul CMS',
                'is_active' => true,
            ],
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Kelola konten dan pengguna',
                'is_active' => true,
            ],
            [
                'name' => 'Editor',
                'slug' => 'editor',
                'description' => 'Review dan publish konten',
                'is_active' => true,
            ],
            [
                'name' => 'Author',
                'slug' => 'author',
                'description' => 'Membuat dan mengedit konten miliknya',
                'is_active' => true,
            ],
            [
                'name' => 'Viewer',
                'slug' => 'viewer',
                'description' => 'Akses baca dashboard dan laporan',
                'is_active' => true,
            ],
        ];

        foreach ($roles as $roleData) {
            Role::query()->updateOrCreate(
                ['slug' => $roleData['slug']],
                $roleData
            );
        }

        $permissions = [
            ['name' => 'Dashboard View', 'slug' => 'dashboard.view', 'group_name' => 'dashboard'],
            ['name' => 'User View', 'slug' => 'users.view', 'group_name' => 'users'],
            ['name' => 'User Create', 'slug' => 'users.create', 'group_name' => 'users'],
            ['name' => 'User Update', 'slug' => 'users.update', 'group_name' => 'users'],
            ['name' => 'User Delete', 'slug' => 'users.delete', 'group_name' => 'users'],
            ['name' => 'Role View', 'slug' => 'roles.view', 'group_name' => 'roles'],
            ['name' => 'Role Create', 'slug' => 'roles.create', 'group_name' => 'roles'],
            ['name' => 'Role Update', 'slug' => 'roles.update', 'group_name' => 'roles'],
            ['name' => 'Role Delete', 'slug' => 'roles.delete', 'group_name' => 'roles'],
            ['name' => 'Permission View', 'slug' => 'permissions.view', 'group_name' => 'permissions'],
            ['name' => 'Permission Create', 'slug' => 'permissions.create', 'group_name' => 'permissions'],
            ['name' => 'Permission Update', 'slug' => 'permissions.update', 'group_name' => 'permissions'],
            ['name' => 'Permission Delete', 'slug' => 'permissions.delete', 'group_name' => 'permissions'],
            ['name' => 'Web Settings View', 'slug' => 'settings.web.view', 'group_name' => 'settings'],
            ['name' => 'Web Settings Update', 'slug' => 'settings.web.update', 'group_name' => 'settings'],
            ['name' => 'Blog Post View', 'slug' => 'posts.view', 'group_name' => 'posts'],
            ['name' => 'Blog Post Create', 'slug' => 'posts.create', 'group_name' => 'posts'],
            ['name' => 'Blog Post Update', 'slug' => 'posts.update', 'group_name' => 'posts'],
            ['name' => 'Blog Post Delete', 'slug' => 'posts.delete', 'group_name' => 'posts'],
            ['name' => 'Category View', 'slug' => 'categories.view', 'group_name' => 'posts'],
            ['name' => 'Category Create', 'slug' => 'categories.create', 'group_name' => 'posts'],
            ['name' => 'Category Update', 'slug' => 'categories.update', 'group_name' => 'posts'],
            ['name' => 'Category Delete', 'slug' => 'categories.delete', 'group_name' => 'posts'],
            ['name' => 'Hashtag View', 'slug' => 'hashtags.view', 'group_name' => 'posts'],
            ['name' => 'Hashtag Create', 'slug' => 'hashtags.create', 'group_name' => 'posts'],
            ['name' => 'Hashtag Update', 'slug' => 'hashtags.update', 'group_name' => 'posts'],
            ['name' => 'Hashtag Delete', 'slug' => 'hashtags.delete', 'group_name' => 'posts'],
            ['name' => 'Page View', 'slug' => 'pages.view', 'group_name' => 'pages'],
            ['name' => 'Page Create', 'slug' => 'pages.create', 'group_name' => 'pages'],
            ['name' => 'Page Update', 'slug' => 'pages.update', 'group_name' => 'pages'],
            ['name' => 'Page Delete', 'slug' => 'pages.delete', 'group_name' => 'pages'],
            ['name' => 'Gallery View', 'slug' => 'galleries.view', 'group_name' => 'gallery'],
            ['name' => 'Gallery Create', 'slug' => 'galleries.create', 'group_name' => 'gallery'],
            ['name' => 'Gallery Update', 'slug' => 'galleries.update', 'group_name' => 'gallery'],
            ['name' => 'Gallery Delete', 'slug' => 'galleries.delete', 'group_name' => 'gallery'],
            ['name' => 'Gallery Image View', 'slug' => 'gallery-images.view', 'group_name' => 'gallery'],
            ['name' => 'Gallery Image Create', 'slug' => 'gallery-images.create', 'group_name' => 'gallery'],
            ['name' => 'Gallery Image Update', 'slug' => 'gallery-images.update', 'group_name' => 'gallery'],
            ['name' => 'Gallery Image Delete', 'slug' => 'gallery-images.delete', 'group_name' => 'gallery'],
            ['name' => 'Media View', 'slug' => 'media.view', 'group_name' => 'media'],
            ['name' => 'Media Upload', 'slug' => 'media.upload', 'group_name' => 'media'],
            ['name' => 'Media Delete', 'slug' => 'media.delete', 'group_name' => 'media'],
            ['name' => 'Menu View', 'slug' => 'menus.view', 'group_name' => 'menus'],
            ['name' => 'Menu Update', 'slug' => 'menus.update', 'group_name' => 'menus'],
            ['name' => 'Notification View', 'slug' => 'notifications.view', 'group_name' => 'notifications'],
            ['name' => 'Notification Create', 'slug' => 'notifications.create', 'group_name' => 'notifications'],
            ['name' => 'Notification Update', 'slug' => 'notifications.update', 'group_name' => 'notifications'],
            ['name' => 'Notification Delete', 'slug' => 'notifications.delete', 'group_name' => 'notifications'],
            ['name' => 'Audit Log View', 'slug' => 'audit-logs.view', 'group_name' => 'audit'],
            ['name' => 'Contact Message View', 'slug' => 'contact-messages.view', 'group_name' => 'contact-messages'],
            ['name' => 'Contact Message Update', 'slug' => 'contact-messages.update', 'group_name' => 'contact-messages'],
            ['name' => 'Contact Message Delete', 'slug' => 'contact-messages.delete', 'group_name' => 'contact-messages'],
            ['name' => 'Analytics View', 'slug' => 'analytics.view', 'group_name' => 'analytics'],
            ['name' => 'Message View', 'slug' => 'messages.view', 'group_name' => 'messages'],
        ];

        foreach ($permissions as $permissionData) {
            Permission::query()->updateOrCreate(
                ['slug' => $permissionData['slug']],
                [
                    ...$permissionData,
                    'description' => $permissionData['name'],
                ]
            );
        }

        $allPermissionIds = Permission::query()->pluck('id')->all();
        $viewerPermissionIds = Permission::query()
            ->whereIn('slug', [
                'dashboard.view',
                'analytics.view',
                'messages.view',
                'posts.view',
                'categories.view',
                'hashtags.view',
                'pages.view',
                'galleries.view',
                'gallery-images.view',
                'media.view',
                'users.view',
                'roles.view',
                'permissions.view',
                'settings.web.view',
                'menus.view',
            ])
            ->pluck('id')
            ->all();
        $authorPermissionIds = Permission::query()
            ->whereIn('slug', [
                'dashboard.view',
                'posts.view',
                'posts.create',
                'posts.update',
                'categories.view',
                'hashtags.view',
                'pages.view',
                'galleries.view',
                'galleries.create',
                'galleries.update',
                'gallery-images.view',
                'gallery-images.create',
                'gallery-images.update',
                'media.view',
                'media.upload',
            ])
            ->pluck('id')
            ->all();
        $editorPermissionIds = Permission::query()
            ->whereIn('slug', [
                'dashboard.view',
                'posts.view',
                'posts.create',
                'posts.update',
                'posts.delete',
                'categories.view',
                'categories.create',
                'categories.update',
                'categories.delete',
                'hashtags.view',
                'hashtags.create',
                'hashtags.update',
                'hashtags.delete',
                'pages.view',
                'pages.create',
                'pages.update',
                'pages.delete',
                'galleries.view',
                'galleries.create',
                'galleries.update',
                'galleries.delete',
                'gallery-images.view',
                'gallery-images.create',
                'gallery-images.update',
                'gallery-images.delete',
                'media.view',
                'media.upload',
                'media.delete',
                'messages.view',
                'analytics.view',
            ])
            ->pluck('id')
            ->all();
        $adminPermissionIds = Permission::query()
            ->whereNotIn('slug', ['roles.delete', 'permissions.delete', 'audit-logs.view'])
            ->pluck('id')
            ->all();

        Role::query()->where('slug', 'superadmin')->first()?->permissions()->sync($allPermissionIds);
        Role::query()->where('slug', 'admin')->first()?->permissions()->sync($adminPermissionIds);
        Role::query()->where('slug', 'editor')->first()?->permissions()->sync($editorPermissionIds);
        Role::query()->where('slug', 'author')->first()?->permissions()->sync($authorPermissionIds);
        Role::query()->where('slug', 'viewer')->first()?->permissions()->sync($viewerPermissionIds);
    }
}
