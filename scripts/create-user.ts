/**
 * Create or update a HeartLens user account (used for invite/admin-only mode).
 * Usage: npm run create-user -- --email <email> --password <password> [--admin]
 */

// Load .env before importing modules that read process.env (Node >= 20.12).
try {
  (process as unknown as { loadEnvFile?: (p?: string) => void }).loadEnvFile?.();
} catch {
  /* .env is optional if the variables are already present in the environment */
}

function getArg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = getArg('email');
  const password = getArg('password');
  const isAdmin = process.argv.includes('--admin');

  if (!email || !password) {
    console.error('Usage: npm run create-user -- --email <email> --password <password> [--admin]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  // Imported dynamically so .env is loaded before PrismaClient is constructed.
  const { prisma } = await import('../src/lib/server/db');
  const { hashPassword } = await import('../src/lib/server/password');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isAdmin },
    create: { email, passwordHash, isAdmin },
  });
  console.log(`✓ User ready: ${user.email}${user.isAdmin ? ' (admin)' : ''}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
