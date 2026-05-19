import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Balfour Beatty',
      businessName: 'Balfour Beatty PLC',
      email: 'procurement@balfourbeatty.com',
      contactNum: '020 7963 4000',
      trustedPayer: true,
      creditLimit: 50000,
      billingAddress: '5 Churchill Place, London E14 5HU',
      vatNumber: 'GB 123456789',
      orders: {
        create: [
          {
            orderDate: '2024-06-15',
            quotationNo: 'Q-2024-001',
            projectName: 'Kings Cross Office Block',
            projectReference: 'BB-KC-2024',
            siteContactManager: 'James Wilson',
            siteContactManagerNumber: '07700 900001',
            status: 'PENDING',
            orderValue: 28500.0,
            siteAddress: 'Kings Cross, London N1C 4AX',
            lastUpdatedBy: 'Kieran',
            items: {
              create: [
                {
                  itemName: 'FCA-2000 Fire Curtain',
                  reference: 'FC-001',
                  itemQuantity: 2,
                  width: 2000,
                  drop: 3000,
                  cost: 9500.0,
                  extras: [{ productName: 'Side Guide', quantity: 2 }],
                },
                {
                  itemName: 'FCA-3000 Fire Curtain',
                  reference: 'FC-002',
                  itemQuantity: 1,
                  width: 3000,
                  drop: 4000,
                  cost: 9500.0,
                  extras: [],
                },
              ],
            },
          },
        ],
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Wates Group',
      businessName: 'Wates Group Ltd',
      email: 'orders@watesgroup.co.uk',
      contactNum: '01onal 372 861000',
      trustedPayer: true,
      creditLimit: 75000,
      billingAddress: 'Wates House, Station Approach, Leatherhead KT22 7SW',
      vatNumber: 'GB 987654321',
      cisDeductions: true,
      cisRate: '20%',
      orders: {
        create: [
          {
            orderDate: '2024-07-01',
            quotationNo: 'Q-2024-002',
            projectName: 'Manchester Hospital Extension',
            projectReference: 'WG-MH-2024',
            siteContactManager: 'Sarah Thompson',
            siteContactManagerNumber: '07700 900002',
            status: 'PRODUCTION_SPECIFICATION',
            orderValue: 45000.0,
            siteAddress: 'Oxford Road, Manchester M13 9WL',
            lastUpdatedBy: 'Kieran',
            pendingCompleted: true,
            pendingPurchaseOrder: true,
            pendingSurvey: true,
            pendingDrawings: true,
            pendingDrawingsApproved: true,
            pendingDepositPaid: true,
            items: {
              create: [
                {
                  itemName: 'FCA-4000 Fire Curtain',
                  reference: 'FC-003',
                  itemQuantity: 3,
                  width: 4000,
                  drop: 3500,
                  cost: 15000.0,
                  extras: [
                    { productName: 'Smoke Seal', quantity: 3 },
                    { productName: 'Motor Upgrade', quantity: 3 },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seeded customers:', customer1.id, customer2.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
