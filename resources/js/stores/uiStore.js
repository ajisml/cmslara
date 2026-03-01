import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
    persist(
        (set) => ({
            navMode: 'sidebar',
            sidebarOpen: true,
            darkMode: false,
            setNavMode: (mode) => set({ navMode: mode }),
            toggleSidebar: () =>
                set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            toggleDarkMode: () =>
                set((state) => ({ darkMode: !state.darkMode })),
        }),
        {
            name: 'cms-ui-state',
            version: 2,
            partialize: (state) => ({
                navMode: state.navMode,
                sidebarOpen: state.sidebarOpen,
            }),
            migrate: (persistedState, version) => {
                if (version < 2) {
                    return {
                        ...persistedState,
                        darkMode: false,
                    };
                }

                return {
                    ...persistedState,
                    darkMode: false,
                };
            },
        },
    ),
);
