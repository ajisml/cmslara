<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderMenuRequest;
use App\Http\Requests\Admin\StoreMenuRequest;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Models\Menu;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MenuController extends Controller
{
    public function index(): Response
    {
        $menus = Menu::query()
            ->orderBy('parent_id')
            ->orderBy('position')
            ->get([
                'id',
                'title',
                'url',
                'target',
                'icon',
                'parent_id',
                'position',
                'is_active',
            ]);

        return Inertia::render('Menus/Index', [
            'menuTree' => $this->buildTree($menus),
            'menuOptions' => $menus->map(fn (Menu $menu): array => [
                'id' => $menu->id,
                'title' => $menu->title,
                'parent_id' => $menu->parent_id,
            ])->values()->all(),
        ]);
    }

    public function store(StoreMenuRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['position'] = $this->nextPosition($validated['parent_id'] ?? null);
        $validated['url'] = $this->nullableString($validated['url'] ?? null);
        $validated['icon'] = $this->nullableString($validated['icon'] ?? null);

        Menu::create($validated);

        return back()->with('success', 'Menu berhasil ditambahkan.');
    }

    public function update(UpdateMenuRequest $request, Menu $menu): RedirectResponse
    {
        $validated = $request->validated();
        $newParentId = $validated['parent_id'] ?? null;

        if ($this->isDescendant($menu->id, $newParentId)) {
            return back()->with('error', 'Parent menu tidak valid.');
        }

        if ($newParentId !== $menu->parent_id) {
            $validated['position'] = $this->nextPosition($newParentId);
        }

        $validated['url'] = $this->nullableString($validated['url'] ?? null);
        $validated['icon'] = $this->nullableString($validated['icon'] ?? null);

        $menu->update($validated);

        return back()->with('success', 'Menu berhasil diperbarui.');
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        $menu->delete();

        return back()->with('success', 'Menu berhasil dihapus.');
    }

    public function reorder(ReorderMenuRequest $request): RedirectResponse
    {
        $items = collect($request->validated('items'));

        if ($this->hasCycle($items)) {
            return back()->with('error', 'Struktur menu tidak valid karena membentuk loop.');
        }

        DB::transaction(function () use ($items): void {
            foreach ($items as $item) {
                Menu::query()
                    ->whereKey($item['id'])
                    ->update([
                        'parent_id' => $item['parent_id'],
                        'position' => $item['position'],
                    ]);
            }
        });

        return back()->with('success', 'Urutan menu berhasil diperbarui.');
    }

    private function nextPosition(?int $parentId): int
    {
        $maxPosition = Menu::query()
            ->where('parent_id', $parentId)
            ->max('position');

        return ($maxPosition ?? -1) + 1;
    }

    private function nullableString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private function hasCycle(Collection $items): bool
    {
        $parentById = $items
            ->mapWithKeys(fn (array $item) => [(int) $item['id'] => $item['parent_id'] ? (int) $item['parent_id'] : null])
            ->all();

        foreach (array_keys($parentById) as $id) {
            $seen = [];
            $current = $id;

            while ($current !== null && array_key_exists($current, $parentById)) {
                if (in_array($current, $seen, true)) {
                    return true;
                }

                $seen[] = $current;
                $current = $parentById[$current];
            }
        }

        return false;
    }

    private function isDescendant(int $menuId, ?int $targetParentId): bool
    {
        if ($targetParentId === null) {
            return false;
        }

        if ($menuId === $targetParentId) {
            return true;
        }

        $currentParent = Menu::query()->whereKey($targetParentId)->value('parent_id');

        while ($currentParent !== null) {
            if ((int) $currentParent === $menuId) {
                return true;
            }

            $currentParent = Menu::query()->whereKey($currentParent)->value('parent_id');
        }

        return false;
    }

    private function buildTree(Collection $menus, ?int $parentId = null): array
    {
        return $menus
            ->filter(fn (Menu $menu) => $menu->parent_id === $parentId)
            ->sortBy('position')
            ->values()
            ->map(fn (Menu $menu): array => [
                'id' => $menu->id,
                'title' => $menu->title,
                'url' => $menu->url,
                'target' => $menu->target,
                'icon' => $menu->icon,
                'parent_id' => $menu->parent_id,
                'position' => $menu->position,
                'is_active' => $menu->is_active,
                'children' => $this->buildTree($menus, $menu->id),
            ])
            ->all();
    }
}
