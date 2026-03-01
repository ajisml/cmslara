<?php

namespace App\Support;

use App\Models\User;

class ContentWorkflow
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_REVIEW = 'review';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_PUBLISHED = 'published';

    /**
     * @return array<int, string>
     */
    public static function statuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_REVIEW,
            self::STATUS_APPROVED,
            self::STATUS_PUBLISHED,
        ];
    }

    public static function isValidStatus(?string $status): bool
    {
        if ($status === null) {
            return false;
        }

        return in_array($status, self::statuses(), true);
    }

    public static function canSubmitForReview(User $user, ?int $ownerId): bool
    {
        if (in_array($user->role, ['admin', 'superadmin'], true)) {
            return true;
        }

        return $ownerId !== null && $ownerId === $user->id;
    }

    public static function canApprove(User $user): bool
    {
        return in_array($user->role, ['editor', 'admin', 'superadmin'], true);
    }

    public static function canPublish(User $user): bool
    {
        return in_array($user->role, ['admin', 'superadmin'], true);
    }

    public static function canSendBack(User $user): bool
    {
        return in_array($user->role, ['editor', 'admin', 'superadmin'], true);
    }

    /**
     * @return array<string, bool>
     */
    public static function allowedActions(User $user, string $status, ?int $ownerId): array
    {
        return [
            'submit_review' => $status === self::STATUS_DRAFT
                && self::canSubmitForReview($user, $ownerId),
            'approve' => $status === self::STATUS_REVIEW
                && self::canApprove($user),
            'publish' => $status === self::STATUS_APPROVED
                && self::canPublish($user),
            'send_back' => in_array(
                $status,
                [self::STATUS_REVIEW, self::STATUS_APPROVED, self::STATUS_PUBLISHED],
                true,
            ) && self::canSendBack($user),
        ];
    }
}
