import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const slugs = [
    { slug: 'bangkok-to-pattaya-transfer-guide-2025', date: new Date('2026-05-19T10:00:00Z') },
    { slug: 'top-10-things-to-do-in-phuket-first-timer-guide', date: new Date('2026-05-18T10:00:00Z') },
    { slug: 'krabi-vs-phuket-which-island-to-visit-2025', date: new Date('2026-05-17T10:00:00Z') },
  ];
  for (const { slug, date } of slugs) {
    const r = await prisma.blogPost.updateMany({ where: { slug }, data: { publishedAt: date } });
    console.log(`Updated ${slug}: ${r.count} row(s)`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
