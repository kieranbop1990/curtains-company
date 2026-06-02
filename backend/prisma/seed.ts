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

  // Parts library — sourced from Parts List.xlsx
  const partsResult = await prisma.part.createMany({
    skipDuplicates: true,
    data: [
      // Hardware — headboxes
      { partRef: 'HRD-HBOX-160',       name: '160mm x 160mm Headbox',            category: 'Hardware',       description: 'Curtain headbox — various sizes',     unit: 'metre' },
      { partRef: 'HRD-HBOX-180S',      name: '180mm x 180mm Headbox',            category: 'Hardware',       description: 'Curtain headbox — various sizes',     unit: 'metre' },
      { partRef: 'HRD-HBOX-DBL-1',     name: '180mm x 360mm Double Headbox',     category: 'Hardware',       description: 'Curtain headbox — various sizes',     unit: 'metre' },
      { partRef: 'HRD-HBOX-200S',      name: '200mm x 200mm Headbox',            category: 'Hardware',       description: 'Curtain headbox — various sizes',     unit: 'metre' },
      { partRef: 'HRD-HBOX-DBL-2',     name: '200mm x 400mm Double Headbox',     category: 'Hardware',       description: 'Curtain headbox — various sizes',     unit: 'metre' },
      { partRef: 'HRD-HBOX-210S',      name: '210mm x 210mm Headbox',            category: 'Hardware',       description: 'Curtain headbox — various sizes',     unit: 'metre' },
      { partRef: 'HRD-HBOX-225S',      name: '225mm x 225mm Headbox',            category: 'Hardware',       description: 'Curtain headbox — various sizes',     unit: 'metre' },
      // Hardware — rails / guides / structural
      { partRef: 'HRD-BOTRAIL-SQR54',  name: 'Bottom Rail Cover 4-Piece',        category: 'Hardware',       description: '2mm rail cover — square profile',     unit: 'metre' },
      { partRef: 'HRD-BOTRAIL-SQR40',  name: 'Bottom Rail 40mm',                 category: 'Hardware',       description: 'Bottom rail — square/full',           unit: 'metre' },
      { partRef: 'HRD-SKIRT',          name: 'Curtain Skirt',                    category: 'Hardware',       description: 'Curtain skirt — optional',            unit: 'metre' },
      { partRef: 'HRD-ENDPL-LFT',      name: 'End Plate (Left)',                 category: 'Hardware',       description: 'End plate assembly — lead-in/no lead-in', unit: 'pair' },
      { partRef: 'HRD-ENDPL-RHT',      name: 'End Plate (Right)',                category: 'Hardware',       description: 'End plate assembly — lead-in/no lead-in', unit: 'pair' },
      { partRef: 'HRD-TABS',           name: 'Fabric Tabs',                      category: 'Hardware',       description: 'Curtain attachment tabs — optional',  unit: 'metre' },
      { partRef: 'JOIN-PL-DBL',        name: 'Joining Plate Double Headbox',     category: 'Hardware',       description: 'Curtain headbox joining plate',       unit: 'metre' },
      { partRef: 'JOIN-PL-SNG',        name: 'Joining Plate Single Headbox',     category: 'Hardware',       description: 'Curtain headbox joining plate',       unit: 'metre' },
      { partRef: 'HRD-LANDPL',         name: 'Landing Plate',                    category: 'Hardware',       description: 'Landing plate — optional',            unit: 'each' },
      { partRef: 'HRD-BAR100',         name: 'Ø100 Barrel',                      category: 'Hardware',       description: 'CSV steel barrel',                    unit: 'metre' },
      { partRef: 'HRD-BAR89',          name: 'Ø89 Barrel',                       category: 'Hardware',       description: 'DC80 steel barrel',                   unit: 'metre' },
      { partRef: 'HRD-SGUIDE-STD-5',   name: 'Side Guide 5mm Gap',               category: 'Hardware',       description: 'Curtain side guides 100x53 — 5mm gap', unit: 'metre' },
      { partRef: 'HRD-SGUIDE-STD-10',  name: 'Side Guide 10mm Gap',              category: 'Hardware',       description: 'Curtain side guides 100x53 — 10mm gap', unit: 'metre' },
      { partRef: 'HRD-SMKSEAL',        name: 'Smoke Seals',                      category: 'Hardware',       description: 'Smoke seals — optional',              unit: 'metre' },
      { partRef: 'HRD-STOPANG',        name: 'Stopping Angle Bar',               category: 'Hardware',       description: 'Stopping angle bar — optional',       unit: 'metre' },
      { partRef: 'HRD-TFBAR',          name: 'Top Flat Bar',                     category: 'Hardware',       description: '16mm flat bar — HB-100',              unit: 'metre' },
      // Motors — CSV
      { partRef: 'MOT-CSV-S',          name: 'CSV(S) Dunker Motor',              category: 'Motor',          description: 'Small CSV motor — Ø100 barrel',       unit: 'each' },
      { partRef: 'MOT-CSV-L',          name: 'CSV(L) Dunker Motor',              category: 'Motor',          description: 'Large CSV motor — Ø100 barrel',       unit: 'each' },
      { partRef: 'MOT-CSV-XL',         name: 'CSV(XL) Dunker Motor',             category: 'Motor',          description: 'Extra large CSV motor — Ø100 barrel', unit: 'each' },
      // Motors — DC80
      { partRef: 'MOT-DC80-10',        name: 'DC80-10 Motor',                    category: 'Motor',          description: 'Large system motor — Ø89 barrel',     unit: 'each' },
      { partRef: 'MOT-DC80-25',        name: 'DC80-25 Motor',                    category: 'Motor',          description: 'Medium system motor — Ø89 barrel',    unit: 'each' },
      { partRef: 'MOT-DC80-40',        name: 'DC80-40 Motor',                    category: 'Motor',          description: 'Small system motor — Ø89 barrel',     unit: 'each' },
      // Control panels
      { partRef: 'PNL-CSV',            name: 'CSV Control Panel',                category: 'Control Panel',  description: 'CSV control panel — standard',        unit: 'each' },
      // Panels — DC80
      { partRef: 'PNL-DC80-10',        name: 'DC80-10 Panel',                    category: 'Panel',          description: 'Large system DC80 panel — Ø89 barrel', unit: 'each' },
      { partRef: 'PNL-DC80-25',        name: 'DC80-25 Panel',                    category: 'Panel',          description: 'Medium system DC80 panel — Ø89 barrel', unit: 'each' },
      { partRef: 'PNL-DC80-40',        name: 'DC80-40 Panel',                    category: 'Panel',          description: 'Small system DC80 panel — Ø89 barrel', unit: 'each' },
      // MCC
      { partRef: 'MCC-STD-001',        name: 'MCC Panel',                        category: 'MCC',            description: 'Standard Motor Control Card — CSV',   unit: 'each' },
      // Battery
      { partRef: 'BAT-MON',            name: 'Battery & Main Monitor',           category: 'Battery',        description: 'Battery backup & monitor — optional', unit: 'each' },
      // Sensors
      { partRef: 'SNS-AV',             name: 'Audio Visual Sensor',              category: 'Sensor',         description: 'Audio visual warning — optional',     unit: 'each' },
      { partRef: 'SNS-BEAM',           name: 'Beam Sensor Kit',                  category: 'Sensor',         description: 'Beam sensor + reflector + relay + audio visual (full kit) — optional', unit: 'set' },
      // Fabrics — fire curtain
      { partRef: 'FAB-OVLP-1000',      name: 'Fabric Overlap BS8524-1',          category: 'Fabric',         description: 'Fire curtain fabric overlap — BS8524-1', unit: 'metre' },
      { partRef: 'FAB-OVLP-600',       name: 'Fabric Overlap EN1634',            category: 'Fabric',         description: 'Fire curtain fabric overlap — EN1634', unit: 'metre' },
      { partRef: 'FAB-OVLP-300',       name: 'Fabric Overlap EN12101',           category: 'Fabric',         description: 'Smoke curtain fabric overlap — EN12101', unit: 'metre' },
      { partRef: 'FAB-FSPLUS-THS',     name: 'FS Plus (5777 BI 963)',            category: 'Fabric',         description: 'Fire curtain fabric',                 unit: 'metre' },
      { partRef: 'FAB-VALPLUS',        name: 'FS Plus Valmiera Glass 44515 BI',  category: 'Fabric',         description: 'Fire curtain fabric',                 unit: 'metre' },
      { partRef: 'FAB-FS120-THS',      name: 'FS120 (7660/FC120)',               category: 'Fabric',         description: 'Fire curtain fabric',                 unit: 'metre' },
      { partRef: 'FAB-FS240-THS',      name: 'FS240 (7660/FC120)',               category: 'Fabric',         description: 'Fire curtain fabric',                 unit: 'metre' },
      { partRef: 'FAB-VAL240',         name: 'FS240 4415 (2) SP SC',             category: 'Fabric',         description: 'Fire curtain fabric',                 unit: 'metre' },
      // Fabrics — smoke curtain
      { partRef: 'FAB-SMOKE60',        name: 'SmokeSafe 60',                     category: 'Fabric',         description: 'Smoke curtain fabric',                unit: 'metre' },
      { partRef: 'FAB-S-D120-THS',     name: 'SmokeSafe D120',                   category: 'Fabric',         description: 'SmokeSafe smoke curtain fabric',       unit: 'metre' },
      // Accessories
      { partRef: 'ACC-SPLIT',          name: 'Delay / Split Drop',               category: 'Accessory',      description: 'Split drop control — optional',       unit: 'each' },
      { partRef: 'SNS-ERB',            name: 'Emergency Retract Button',         category: 'Accessory',      description: 'Emergency retract button — optional', unit: 'each' },
      { partRef: 'ACC-KEY/S',          name: 'Keyed Alike Keyswitch',            category: 'Accessory',      description: 'Keyswitch control — usually included', unit: 'each' },
      // Brackets
      { partRef: 'BRK-TOP400',         name: 'Top Box Support Bracket 400',      category: 'Bracket',        description: 'Edge support bracket',                unit: 'each' },
      { partRef: 'BRK-TOP600',         name: 'Top Box Support Bracket 600',      category: 'Bracket',        description: 'Approx 600mm support bracket',        unit: 'each' },
      // Labels
      { partRef: 'LAB-BOX',            name: 'Box Label',                        category: 'Label',          description: 'Packaging label — auto generated',    unit: 'each' },
      { partRef: 'LAB-QR',             name: 'QR Label',                         category: 'Label',          description: 'QR tracking label — auto generated',  unit: 'each' },
      // Documentation
      { partRef: 'DOC-MANUAL',         name: 'O&M Manual',                       category: 'Documentation',  description: 'Operations & maintenance manual — generated', unit: 'each' },
      { partRef: 'DOC-WARRANTY',       name: 'Warranty Certificate',             category: 'Documentation',  description: 'Warranty pack — generated',            unit: 'each' },
      // QC
      { partRef: 'QC-FORM',            name: 'QC Form',                          category: 'QC',             description: 'QC checklist — generated',             unit: 'each' },
    ],
  });

  console.log(`Seeded ${partsResult.count} parts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
