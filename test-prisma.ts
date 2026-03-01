
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
console.log('createMany in cannedResponse:', !!prisma.cannedResponse.createMany);
