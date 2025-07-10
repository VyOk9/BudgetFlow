import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const food = await prisma.category.upsert({
    where: { name: 'Food' },
    update: {},
    create: { name: 'Food' },
  });

  const transport = await prisma.category.upsert({
    where: { name: 'Transport' },
    update: {},
    create: { name: 'Transport' },
  });

  console.log('Categories created:', food, transport);

  const expense1 = await prisma.expense.create({
    data: {
      amount: 12.5,
      date: new Date('2025-07-10T10:00:00.000Z'),
      categoryId: food.id,
    },
  });

  const expense2 = await prisma.expense.create({
    data: {
      amount: 7.0,
      date: new Date('2025-07-10T12:00:00.000Z'),
      categoryId: transport.id,
    },
  });

  console.log('Expenses created:', expense1, expense2);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
