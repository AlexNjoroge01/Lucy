import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // Admin credentials
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  const adminName = 'Admin User'

  // ⚠️ Override credentials via ADMIN_EMAIL / ADMIN_PASSWORD env vars,
  // or edit the fallbacks above. NEVER commit real credentials to git.

  // 1. Create or update the ADMIN role with full permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {
      description: 'Full system access with all permissions',
      permissions: [
        'user:read',
        'user:create',
        'user:update',
        'user:delete',
        'content:read',
        'content:create',
        'content:update',
        'content:delete',
        'project:read',
        'project:create',
        'project:update',
        'project:delete',
        'schedule:read',
        'schedule:create',
        'schedule:update',
        'schedule:delete',
        'audit:read',
        'audit:delete',
        'admin:dashboard',
        'admin:metrics',
        'admin:settings',
      ],
    },
    create: {
      name: 'ADMIN',
      description: 'Full system access with all permissions',
      permissions: [
        'user:read',
        'user:create',
        'user:update',
        'user:delete',
        'content:read',
        'content:create',
        'content:update',
        'content:delete',
        'project:read',
        'project:create',
        'project:update',
        'project:delete',
        'schedule:read',
        'schedule:create',
        'schedule:update',
        'schedule:delete',
        'audit:read',
        'audit:delete',
        'admin:dashboard',
        'admin:metrics',
        'admin:settings',
      ],
    },
  })
  console.log('✅ Admin role created/updated:', adminRole.name)

  // 2. Create or update the USER role with limited permissions
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {
      description: 'Standard user with limited permissions',
      permissions: [
        'content:read',
        'content:create',
        'content:update',
        'content:delete',
        'project:read',
        'project:create',
        'project:update',
        'project:delete',
        'schedule:read',
        'schedule:create',
        'schedule:update',
        'schedule:delete',
      ],
    },
    create: {
      name: 'USER',
      description: 'Standard user with limited permissions',
      permissions: [
        'content:read',
        'content:create',
        'content:update',
        'content:delete',
        'project:read',
        'project:create',
        'project:update',
        'project:delete',
        'schedule:read',
        'schedule:create',
        'schedule:update',
        'schedule:delete',
      ],
    },
  })
  console.log('✅ User role created/updated:', userRole.name)

  // 3. Create or update the MODERATOR role
  const moderatorRole = await prisma.role.upsert({
    where: { name: 'MODERATOR' },
    update: {
      description: 'Moderator with content management permissions',
      permissions: [
        'user:read',
        'content:read',
        'content:update',
        'content:delete',
        'project:read',
        'schedule:read',
        'audit:read',
      ],
    },
    create: {
      name: 'MODERATOR',
      description: 'Moderator with content management permissions',
      permissions: [
        'user:read',
        'content:read',
        'content:update',
        'content:delete',
        'project:read',
        'schedule:read',
        'audit:read',
      ],
    },
  })
  console.log('✅ Moderator role created/updated:', moderatorRole.name)

  // 4. Hash the admin password
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  // 5. Create or update the admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
    },
  })
  console.log('✅ Admin user created/updated:', adminUser.email)

  // 6. Assign ADMIN role to the admin user
  const existingUserRole = await prisma.userRole.findFirst({
    where: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    })
    console.log('✅ Admin role assigned to user')
  } else {
    console.log('ℹ️ Admin role already assigned to user')
  }

  // 7. Create an audit log entry for the seeding
  await prisma.auditLog.create({
    data: {
      action: 'SEED',
      entity: 'System',
      entityId: adminUser.id,
      details: JSON.stringify({
        message: 'Database seeded with admin user and roles',
        roles: ['ADMIN', 'USER', 'MODERATOR'],
        adminEmail,
      }),
    },
  })
  console.log('✅ Audit log entry created for seeding')

  console.log('\n🎉 Database seed completed successfully!')
  console.log('\n📧 Admin Credentials:')
  console.log('   Email:', adminEmail)
  console.log('   Password:', adminPassword)
  console.log('   Role: ADMIN')
  console.log('\n⚠️  IMPORTANT: Change the default password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
