<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('contact-submission', function (Request $request) {
            return [
                Limit::perMinute(6)->by($request->ip() ?: 'guest'),
                Limit::perHour(40)->by($request->ip() ?: 'guest'),
            ];
        });

        Vite::prefetch(concurrency: 3);
    }
}
