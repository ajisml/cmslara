import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                primary: 'hsl(205 85% 55%)',
                page: 'hsl(210 25% 97%)',
                'page-dark': 'hsl(220 20% 10%)',
                'card-dark': 'hsl(220 18% 13%)',
                'border-dark': 'hsl(220 15% 18%)',
                'sidebar-dark': 'hsl(220 22% 8%)',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
