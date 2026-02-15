
import { POST } from '../src/app/api/track/route';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
});

async function main() {
  console.log('Verifying tracking API logic...');

  // Create a dummy product for testing
  const slug = 'tracking-test-tool-' + Date.now();
  const product = await prisma.product.create({
    data: {
      slug,
      title: 'Tracking Test Tool',
      category: 'Test'
    }
  });

  const url = 'http://localhost:3000/api/track';
  const body = {
    eventType: 'VIEW',
    slug: slug,
    sessionId: 'test-session-123',
    userId: 'test-user-456'
  };

  const req = new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body)
  });

  // Call the handler directly
  const response = await POST(req);

  if (response.status !== 200) {
    const text = await response.text();
    throw new Error(`API returned status ${response.status}: ${text}`);
  }

  const json = await response.json();
  console.log('API Response:', json);

  if (!json.success || !json.eventId) {
    throw new Error('API response missing success or eventId');
  }

  // Verify in DB
  const event = await prisma.userEvent.findUnique({
    where: { id: json.eventId }
  });

  if (!event) {
    throw new Error('Event not found in database');
  }

  console.log('Event verified in database:', event);

  // Clean up
  await prisma.userEvent.delete({ where: { id: event.id } });
  await prisma.product.delete({ where: { slug } });

  console.log('Tracking API verification passed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
