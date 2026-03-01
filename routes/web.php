<?php

use App\Http\Controllers\Admin\WebSettingController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\RolePermissionController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\HashtagController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\GalleryImageController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\ProfileController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard');

Route::post('/contact/submit', [ContactFormController::class, 'store'])
    ->middleware(['throttle:contact-submission'])
    ->name('contact.submit');

Route::middleware(['auth', 'verified', 'log.admin.activity'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'stats' => [
                'totalUsers' => User::count(),
                'activeUsers' => User::where('is_active', true)->count(),
                'inactiveUsers' => User::where('is_active', false)->count(),
                'admins' => User::whereIn('role', ['superadmin', 'admin'])->count(),
            ],
        ]);
    })->middleware('permission:dashboard.view')->name('dashboard');

    Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.view')->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create')->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:users.update')->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete')->name('users.destroy');

    Route::get('/roles-permissions', [RolePermissionController::class, 'index'])
        ->middleware(['permission:roles.view', 'permission:permissions.view'])
        ->name('roles-permissions.index');
    Route::post('/roles-permissions/roles', [RolePermissionController::class, 'storeRole'])->middleware('permission:roles.create')->name('roles.store');
    Route::put('/roles-permissions/roles/{role}', [RolePermissionController::class, 'updateRole'])->middleware('permission:roles.update')->name('roles.update');
    Route::delete('/roles-permissions/roles/{role}', [RolePermissionController::class, 'destroyRole'])->middleware('permission:roles.delete')->name('roles.destroy');
    Route::put('/roles-permissions/roles/{role}/permissions', [RolePermissionController::class, 'syncRolePermissions'])->middleware('permission:roles.update')->name('roles.permissions.sync');
    Route::post('/roles-permissions/permissions', [RolePermissionController::class, 'storePermission'])->middleware('permission:permissions.create')->name('permissions.store');
    Route::put('/roles-permissions/permissions/{permission}', [RolePermissionController::class, 'updatePermission'])->middleware('permission:permissions.update')->name('permissions.update');
    Route::delete('/roles-permissions/permissions/{permission}', [RolePermissionController::class, 'destroyPermission'])->middleware('permission:permissions.delete')->name('permissions.destroy');

    Route::get('/menus', [MenuController::class, 'index'])->middleware('permission:menus.view')->name('menus.index');
    Route::post('/menus', [MenuController::class, 'store'])->middleware('permission:menus.update')->name('menus.store');
    Route::put('/menus/reorder', [MenuController::class, 'reorder'])->middleware('permission:menus.update')->name('menus.reorder');
    Route::put('/menus/{menu}', [MenuController::class, 'update'])->middleware('permission:menus.update')->name('menus.update');
    Route::delete('/menus/{menu}', [MenuController::class, 'destroy'])->middleware('permission:menus.update')->name('menus.destroy');

    Route::get('/hashtags', [HashtagController::class, 'index'])->middleware('permission:hashtags.view')->name('hashtags.index');
    Route::post('/hashtags', [HashtagController::class, 'store'])->middleware('permission:hashtags.create')->name('hashtags.store');
    Route::put('/hashtags/{hashtag}', [HashtagController::class, 'update'])->middleware('permission:hashtags.update')->name('hashtags.update');
    Route::delete('/hashtags/{hashtag}', [HashtagController::class, 'destroy'])->middleware('permission:hashtags.delete')->name('hashtags.destroy');

    Route::get('/categories', [CategoryController::class, 'index'])->middleware('permission:categories.view')->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('permission:categories.create')->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->middleware('permission:categories.update')->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:categories.delete')->name('categories.destroy');

    Route::get('/galleries', [GalleryController::class, 'index'])->middleware('permission:galleries.view')->name('galleries.index');
    Route::post('/galleries', [GalleryController::class, 'store'])->middleware('permission:galleries.create')->name('galleries.store');
    Route::put('/galleries/{gallery}', [GalleryController::class, 'update'])->middleware('permission:galleries.update')->name('galleries.update');
    Route::delete('/galleries/{gallery}', [GalleryController::class, 'destroy'])->middleware('permission:galleries.delete')->name('galleries.destroy');

    Route::get('/gallery-images', [GalleryImageController::class, 'index'])->middleware('permission:gallery-images.view')->name('gallery-images.index');
    Route::post('/gallery-images', [GalleryImageController::class, 'store'])->middleware('permission:gallery-images.create')->name('gallery-images.store');
    Route::put('/gallery-images/{galleryImage}', [GalleryImageController::class, 'update'])->middleware('permission:gallery-images.update')->name('gallery-images.update');
    Route::delete('/gallery-images/{galleryImage}', [GalleryImageController::class, 'destroy'])->middleware('permission:gallery-images.delete')->name('gallery-images.destroy');

    Route::get('/notifications', [NotificationController::class, 'index'])->middleware('permission:notifications.view')->name('notifications.index');
    Route::post('/notifications', [NotificationController::class, 'store'])->middleware('permission:notifications.create')->name('notifications.store');
    Route::put('/notifications/{notification}', [NotificationController::class, 'update'])->middleware('permission:notifications.update')->name('notifications.update');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->middleware('permission:notifications.delete')->name('notifications.destroy');

    Route::get('/contact-messages', [ContactMessageController::class, 'index'])->middleware('permission:contact-messages.view')->name('contact-messages.index');
    Route::get('/contact-messages/{contactMessage}', [ContactMessageController::class, 'show'])->middleware('permission:contact-messages.view')->name('contact-messages.show');
    Route::put('/contact-messages/{contactMessage}/mark-read', [ContactMessageController::class, 'markRead'])->middleware('permission:contact-messages.update')->name('contact-messages.mark-read');
    Route::put('/contact-messages/{contactMessage}/mark-unread', [ContactMessageController::class, 'markUnread'])->middleware('permission:contact-messages.update')->name('contact-messages.mark-unread');
    Route::delete('/contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy'])->middleware('permission:contact-messages.delete')->name('contact-messages.destroy');

    Route::get('/posts', [PostController::class, 'index'])->middleware('permission:posts.view')->name('posts.index');
    Route::post('/posts', [PostController::class, 'store'])->middleware('permission:posts.create')->name('posts.store');
    Route::put('/posts/{post}', [PostController::class, 'update'])->middleware('permission:posts.update')->name('posts.update');
    Route::put('/posts/{post}/submit-review', [PostController::class, 'submitReview'])->middleware('permission:posts.update')->name('posts.workflow.submit-review');
    Route::put('/posts/{post}/approve', [PostController::class, 'approve'])->middleware('permission:posts.update')->name('posts.workflow.approve');
    Route::put('/posts/{post}/publish', [PostController::class, 'publish'])->middleware('permission:posts.update')->name('posts.workflow.publish');
    Route::put('/posts/{post}/send-back', [PostController::class, 'sendBack'])->middleware('permission:posts.update')->name('posts.workflow.send-back');
    Route::get('/posts/{post}/revisions', [PostController::class, 'revisions'])->middleware('permission:posts.view')->name('posts.revisions');
    Route::put('/posts/{post}/rollback/{revision}', [PostController::class, 'rollback'])->middleware('permission:posts.update')->name('posts.rollback');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->middleware('permission:posts.delete')->name('posts.destroy');
    Route::post('/posts/upload-image', [PostController::class, 'uploadImage'])->middleware('permission:posts.update')->name('posts.upload-image');

    Route::get('/pages', [PageController::class, 'index'])->middleware('permission:pages.view')->name('pages.index');
    Route::post('/pages', [PageController::class, 'store'])->middleware('permission:pages.create')->name('pages.store');
    Route::put('/pages/{page}', [PageController::class, 'update'])->middleware('permission:pages.update')->name('pages.update');
    Route::put('/pages/{page}/submit-review', [PageController::class, 'submitReview'])->middleware('permission:pages.update')->name('pages.workflow.submit-review');
    Route::put('/pages/{page}/approve', [PageController::class, 'approve'])->middleware('permission:pages.update')->name('pages.workflow.approve');
    Route::put('/pages/{page}/publish', [PageController::class, 'publish'])->middleware('permission:pages.update')->name('pages.workflow.publish');
    Route::put('/pages/{page}/send-back', [PageController::class, 'sendBack'])->middleware('permission:pages.update')->name('pages.workflow.send-back');
    Route::get('/pages/{page}/revisions', [PageController::class, 'revisions'])->middleware('permission:pages.view')->name('pages.revisions');
    Route::put('/pages/{page}/rollback/{revision}', [PageController::class, 'rollback'])->middleware('permission:pages.update')->name('pages.rollback');
    Route::delete('/pages/{page}', [PageController::class, 'destroy'])->middleware('permission:pages.delete')->name('pages.destroy');
    Route::post('/pages/upload-image', [PageController::class, 'uploadImage'])->middleware('permission:pages.update')->name('pages.upload-image');

    Route::get('/settings/web', [WebSettingController::class, 'edit'])->middleware('permission:settings.web.view')->name('web-settings.edit');
    Route::post('/settings/web', [WebSettingController::class, 'update'])->middleware('permission:settings.web.update')->name('web-settings.update');

    Route::get('/audit-logs', [AuditLogController::class, 'index'])
        ->middleware('permission:audit-logs.view')
        ->name('audit-logs.index');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
