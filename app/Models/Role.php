<?php

namespace App\Models;

enum Role: int
{
    case ROLE_User = 0;
    case ROLE_Admin = 1;

    public static function fromString(string $role): static
    {
        return match($role) {
            'ROLE_User' => static::ROLE_User,
            'ROLE_Admin' => static::ROLE_Admin,
            default => throw new \InvalidArgumentException("Invalid role"),
        };
    }

}
