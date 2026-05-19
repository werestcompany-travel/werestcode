import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const r = await p.blogPost.updateMany({
    where: { slug: 'pattaya-3-day-perfect-itinerary-2025' },
    data: { featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80&auto=format&fit=crop' },
  });
  console.log('Pattaya image fixed:', r.count, 'row(s)');
}
main().catch(console.error).finally(() => p.$disconnect());
