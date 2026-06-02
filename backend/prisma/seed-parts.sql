INSERT INTO "Part" (id, "partRef", name, category, description, unit, active, "createdAt", "updatedAt")
VALUES
(gen_random_uuid(), 'HRD-HBOX-180S',     '180mm x 180mm Headbox',           'Hardware',      'Curtain headbox — various sizes',                              'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-HBOX-DBL-1',    '180mm x 360mm Double Headbox',    'Hardware',      'Curtain headbox — various sizes',                              'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-HBOX-200S',     '200mm x 200mm Headbox',           'Hardware',      'Curtain headbox — various sizes',                              'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-HBOX-DBL-2',    '200mm x 400mm Double Headbox',    'Hardware',      'Curtain headbox — various sizes',                              'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-HBOX-210S',     '210mm x 210mm Headbox',           'Hardware',      'Curtain headbox — various sizes',                              'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-HBOX-225S',     '225mm x 225mm Headbox',           'Hardware',      'Curtain headbox — various sizes',                              'metre', true, now(), now()),

-- Hardware — rails / guides / structural
(gen_random_uuid(), 'HRD-BOTRAIL-SQR54', 'Bottom Rail Cover 4-Piece',       'Hardware',      '2mm rail cover — square profile',                             'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-BOTRAIL-SQR40', 'Bottom Rail 40mm',                'Hardware',      'Bottom rail — square/full',                                    'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-SKIRT',         'Curtain Skirt',                   'Hardware',      'Curtain skirt — optional',                                     'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-ENDPL-LFT',     'End Plate (Left)',                'Hardware',      'End plate assembly — lead-in/no lead-in',                      'pair',  true, now(), now()),
(gen_random_uuid(), 'HRD-ENDPL-RHT',     'End Plate (Right)',               'Hardware',      'End plate assembly — lead-in/no lead-in',                      'pair',  true, now(), now()),
(gen_random_uuid(), 'HRD-TABS',          'Fabric Tabs',                     'Hardware',      'Curtain attachment tabs — optional',                           'metre', true, now(), now()),
(gen_random_uuid(), 'JOIN-PL-DBL',       'Joining Plate Double Headbox',    'Hardware',      'Curtain headbox joining plate',                                'metre', true, now(), now()),
(gen_random_uuid(), 'JOIN-PL-SNG',       'Joining Plate Single Headbox',    'Hardware',      'Curtain headbox joining plate',                                'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-LANDPL',        'Landing Plate',                   'Hardware',      'Landing plate — optional',                                     'each',  true, now(), now()),
(gen_random_uuid(), 'HRD-BAR100',        'Ø100 Barrel',                     'Hardware',      'CSV steel barrel',                                             'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-BAR89',         'Ø89 Barrel',                      'Hardware',      'DC80 steel barrel',                                            'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-SGUIDE-STD-5',  'Side Guide 5mm Gap',              'Hardware',      'Curtain side guides 100x53 — 5mm gap',                         'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-SGUIDE-STD-10', 'Side Guide 10mm Gap',             'Hardware',      'Curtain side guides 100x53 — 10mm gap',                        'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-SMKSEAL',       'Smoke Seals',                     'Hardware',      'Smoke seals — optional',                                       'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-STOPANG',       'Stopping Angle Bar',              'Hardware',      'Stopping angle bar — optional',                                'metre', true, now(), now()),
(gen_random_uuid(), 'HRD-TFBAR',         'Top Flat Bar',                    'Hardware',      '16mm flat bar — HB-100',                                       'metre', true, now(), now()),

-- Motors — CSV
(gen_random_uuid(), 'MOT-CSV-S',         'CSV(S) Dunker Motor',             'Motor',         'Small CSV motor — Ø100 barrel',                                'each',  true, now(), now()),
(gen_random_uuid(), 'MOT-CSV-L',         'CSV(L) Dunker Motor',             'Motor',         'Large CSV motor — Ø100 barrel',                                'each',  true, now(), now()),
(gen_random_uuid(), 'MOT-CSV-XL',        'CSV(XL) Dunker Motor',            'Motor',         'Extra large CSV motor — Ø100 barrel',                          'each',  true, now(), now()),

-- Motors — DC80
(gen_random_uuid(), 'MOT-DC80-10',       'DC80-10 Motor',                   'Motor',         'Large system motor — Ø89 barrel',                              'each',  true, now(), now()),
(gen_random_uuid(), 'MOT-DC80-25',       'DC80-25 Motor',                   'Motor',         'Medium system motor — Ø89 barrel',                             'each',  true, now(), now()),
(gen_random_uuid(), 'MOT-DC80-40',       'DC80-40 Motor',                   'Motor',         'Small system motor — Ø89 barrel',                              'each',  true, now(), now()),

-- Control panels
(gen_random_uuid(), 'PNL-CSV',           'CSV Control Panel',               'Control Panel', 'CSV control panel — standard',                                 'each',  true, now(), now()),

-- Panels — DC80
(gen_random_uuid(), 'PNL-DC80-10',       'DC80-10 Panel',                   'Panel',         'Large system DC80 panel — Ø89 barrel',                         'each',  true, now(), now()),
(gen_random_uuid(), 'PNL-DC80-25',       'DC80-25 Panel',                   'Panel',         'Medium system DC80 panel — Ø89 barrel',                        'each',  true, now(), now()),
(gen_random_uuid(), 'PNL-DC80-40',       'DC80-40 Panel',                   'Panel',         'Small system DC80 panel — Ø89 barrel',                         'each',  true, now(), now()),

-- MCC
(gen_random_uuid(), 'MCC-STD-001',       'MCC Panel',                       'MCC',           'Standard Motor Control Card — CSV',                            'each',  true, now(), now()),

-- Battery
(gen_random_uuid(), 'BAT-MON',           'Battery & Main Monitor',          'Battery',       'Battery backup & monitor — optional',                          'each',  true, now(), now()),

-- Sensors
(gen_random_uuid(), 'SNS-AV',            'Audio Visual Sensor',             'Sensor',        'Audio visual warning — optional',                              'each',  true, now(), now()),
(gen_random_uuid(), 'SNS-BEAM',          'Beam Sensor Kit',                 'Sensor',        'Beam sensor + reflector + relay + audio visual (full kit)',    'set',   true, now(), now()),

-- Fabrics — fire curtain
(gen_random_uuid(), 'FAB-OVLP-1000',     'Fabric Overlap BS8524-1',         'Fabric',        'Fire curtain fabric overlap — BS8524-1',                       'metre', true, now(), now()),
(gen_random_uuid(), 'FAB-OVLP-600',      'Fabric Overlap EN1634',           'Fabric',        'Fire curtain fabric overlap — EN1634',                         'metre', true, now(), now()),
(gen_random_uuid(), 'FAB-OVLP-300',      'Fabric Overlap EN12101',          'Fabric',        'Smoke curtain fabric overlap — EN12101',                       'metre', true, now(), now()),
(gen_random_uuid(), 'FAB-FSPLUS-THS',    'FS Plus (5777 BI 963)',           'Fabric',        'Fire curtain fabric',                                          'metre', true, now(), now()),
(gen_random_uuid(), 'FAB-VALPLUS',       'FS Plus Valmiera Glass 44515 BI', 'Fabric',        'Fire curtain fabric',                                          'metre', true, now(), now()),
(gen_random_uuid(), 'FAB-FS120-THS',     'FS120 (7660/FC120)',              'Fabric',        'Fire curtain fabric',                                          'metre', true, now(), now()),
(gen_random_uuid(), 'FAB-FS240-THS',     'FS240 (7660/FC120)',              'Fabric',        'Fire curtain fabric',                                          'metre', true, now(), now()),
(gen_random_uuid(), 'FAB-VAL240',        'FS240 4415 (2) SP SC',            'Fabric',        'Fire curtain fabric',                                          'metre', true, now(), now()),

-- Fabrics — smoke curtain
(gen_random_uuid(), 'FAB-SMOKE60',       'SmokeSafe 60',                    'Fabric',        'Smoke curtain fabric',                                         'metre', true, now(), now()),
(gen_random_uuid(), 'FAB-S-D120-THS',    'SmokeSafe D120',                  'Fabric',        'SmokeSafe smoke curtain fabric',                               'metre', true, now(), now()),

-- Accessories
(gen_random_uuid(), 'ACC-SPLIT',         'Delay / Split Drop',              'Accessory',     'Split drop control — optional',                                'each',  true, now(), now()),
(gen_random_uuid(), 'SNS-ERB',           'Emergency Retract Button',        'Accessory',     'Emergency retract button — optional',                          'each',  true, now(), now()),
(gen_random_uuid(), 'ACC-KEY/S',         'Keyed Alike Keyswitch',           'Accessory',     'Keyswitch control — usually included',                         'each',  true, now(), now()),

-- Brackets
(gen_random_uuid(), 'BRK-TOP400',        'Top Box Support Bracket 400',     'Bracket',       'Edge support bracket',                                         'each',  true, now(), now()),
(gen_random_uuid(), 'BRK-TOP600',        'Top Box Support Bracket 600',     'Bracket',       'Approx 600mm support bracket',                                 'each',  true, now(), now()),

-- Labels
(gen_random_uuid(), 'LAB-BOX',           'Box Label',                       'Label',         'Packaging label — auto generated',                             'each',  true, now(), now()),
(gen_random_uuid(), 'LAB-QR',            'QR Label',                        'Label',         'QR tracking label — auto generated',                           'each',  true, now(), now()),

-- Documentation
(gen_random_uuid(), 'DOC-MANUAL',        'O&M Manual',                      'Documentation', 'Operations & maintenance manual — generated',                  'each',  true, now(), now()),
(gen_random_uuid(), 'DOC-WARRANTY',      'Warranty Certificate',            'Documentation', 'Warranty pack — generated',                                    'each',  true, now(), now()),

-- QC
(gen_random_uuid(), 'QC-FORM',           'QC Form',                         'QC',            'QC checklist — generated',                                     'each',  true, now(), now())
