-- Insert super admin user
-- Default credentials: admin@example.com / superadmin123
-- IMPORTANT: Change this password after first login!
INSERT INTO "users" ("email", "name", "password", "createdAt", "updatedAt")
VALUES (
    'admin@example.com',
    'Super Admin',
    '$2b$10$6.gLcXi9iD9kUm4hJzDh9e.UIZChK1pJhC0k6jjdnGyCtszMpXDgm',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO NOTHING;

-- Assign SUPER_ADMIN role to the super admin user
INSERT INTO "user_roles" ("userId", "roleId", "createdAt")
SELECT
    u."id" as "userId",
    r."id" as "roleId",
    CURRENT_TIMESTAMP as "createdAt"
FROM "users" u
CROSS JOIN "roles" r
WHERE u."email" = 'admin@example.com'
AND r."name" = 'SUPER_ADMIN'
ON CONFLICT ("userId", "roleId") DO NOTHING;
