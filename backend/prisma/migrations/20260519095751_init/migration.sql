-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OFFICE_OPERATIONS', 'ENGINEER_FIELD', 'FINANCE_ACCOUNTS', 'PRODUCTION', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "TransitionMethod" AS ENUM ('NORMAL', 'ADMIN_OVERRIDE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PRODUCTION_SPECIFICATION', 'PRODUCTION_READY', 'BOOKING', 'INSTALLATION', 'INVOICE');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('NEW', 'ACTIVE', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "EnquirySource" AS ENUM ('REFERRAL', 'WEBSITE', 'COLD_CALL', 'REPEAT_CUSTOMER', 'TRADE_SHOW', 'XERO_IMPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('LIVE_ACTIVE', 'OVERDUE', 'SERVICE_DUE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "AssetPriority" AS ENUM ('HOT', 'HIGH', 'NORMAL');

-- CreateEnum
CREATE TYPE "LQStage" AS ENUM ('LQ', 'SD');

-- CreateEnum
CREATE TYPE "LQRoutingDecision" AS ENUM ('PRODUCTION_PACK', 'LIVE_SERVICES');

-- CreateEnum
CREATE TYPE "DrawingStatus" AS ENUM ('ISSUED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('NOT_STARTED', 'IN_REVIEW', 'CUSTOMER_APPROVED', 'CUSTOMER_REJECTED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "ServiceQuoteStatus" AS ENUM ('QUOTE_DRAFTED', 'SENT', 'CHASING', 'ORDER_PLACED', 'LIVE_CLOSED');

-- CreateEnum
CREATE TYPE "ServiceFrequency" AS ENUM ('MONTHLY', 'SEMI_ANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "XeroDocSource" AS ENUM ('UPLOAD', 'API');

-- CreateEnum
CREATE TYPE "MfgStatus" AS ENUM ('BOOKING_PRODUCTION', 'AWAITING_SMOKE_ALARMS', 'FABRICATION', 'ASSEMBLY', 'QC', 'DISPATCH');

-- CreateEnum
CREATE TYPE "MfgSource" AS ENUM ('LG', 'LS');

-- CreateEnum
CREATE TYPE "ComponentStatus" AS ENUM ('AWAITING_STOCK_OUT', 'IN_PRODUCTION', 'AWAITING_QC', 'READY_TO_RELEASE', 'MADE_FOR_REUSE');

-- CreateEnum
CREATE TYPE "SystemFamily" AS ENUM ('NECO_DC80', 'CSV');

-- CreateEnum
CREATE TYPE "DistributionType" AS ENUM ('COLLECTION', 'DELIVERY', 'INSTALLATION');

-- CreateEnum
CREATE TYPE "PaymentMilestoneStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "StageTransitionLog" (
    "id" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "fromStage" TEXT NOT NULL,
    "toStage" TEXT NOT NULL,
    "transitionMethod" "TransitionMethod" NOT NULL,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageTransitionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessName" TEXT,
    "email" TEXT,
    "contactNum" TEXT,
    "accountsContact" TEXT,
    "regNumber" TEXT,
    "trustedPayer" BOOLEAN NOT NULL DEFAULT false,
    "creditLimit" INTEGER NOT NULL DEFAULT 0,
    "billingAddress" TEXT,
    "accountsEmail" TEXT,
    "vatNumber" TEXT,
    "taxReference" TEXT,
    "vatExempt" BOOLEAN NOT NULL DEFAULT false,
    "vatReverse" BOOLEAN NOT NULL DEFAULT false,
    "cisDeductions" BOOLEAN NOT NULL DEFAULT false,
    "cisName" TEXT,
    "cisRate" TEXT,
    "cisOrgType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderDate" TEXT,
    "quotationNo" TEXT,
    "projectName" TEXT,
    "projectReference" TEXT,
    "siteContactManager" TEXT,
    "siteContactSupervisor" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "orderValue" DOUBLE PRECISION,
    "siteAddress" TEXT,
    "lastUpdatedBy" TEXT NOT NULL,
    "sfclTerms" TEXT,
    "sfclCreditScore" TEXT,
    "sfclRecommended" TEXT,
    "sfclInsured" BOOLEAN NOT NULL DEFAULT false,
    "supply" TEXT,
    "customerCollection" BOOLEAN NOT NULL DEFAULT false,
    "deliveryCharge" TEXT,
    "estimatedCollectionDelivery" TEXT,
    "estimateProjectCompletion" TEXT,
    "sfclDelivered" TEXT,
    "siteContactManagerNumber" TEXT,
    "siteContactSupervisorNumber" TEXT,
    "siteWorkingHours" TEXT,
    "pendingPurchaseOrder" BOOLEAN NOT NULL DEFAULT false,
    "pendingSurvey" BOOLEAN NOT NULL DEFAULT false,
    "pendingDrawings" BOOLEAN NOT NULL DEFAULT false,
    "pendingDrawingsApproved" BOOLEAN NOT NULL DEFAULT false,
    "pendingDepositPaid" BOOLEAN NOT NULL DEFAULT false,
    "pendingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "pendingOrderPlaced" BOOLEAN NOT NULL DEFAULT false,
    "pendingShippingDetails" BOOLEAN NOT NULL DEFAULT false,
    "pendingInvoices" BOOLEAN NOT NULL DEFAULT false,
    "pendingQuotationDetails" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceQuote" (
    "id" TEXT NOT NULL,
    "sQuoteRef" TEXT NOT NULL,
    "status" "ServiceQuoteStatus" NOT NULL DEFAULT 'QUOTE_DRAFTED',
    "customerName" TEXT NOT NULL,
    "assetId" TEXT,
    "assetRef" TEXT,
    "serviceCategory" TEXT,
    "contractType" TEXT,
    "frequency" "ServiceFrequency",
    "numVisits" INTEGER,
    "slaResponse" TEXT,
    "slaResolution" TEXT,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "fabricIncluded" BOOLEAN NOT NULL DEFAULT false,
    "labourIncluded" BOOLEAN NOT NULL DEFAULT false,
    "serviceRate" DOUBLE PRECISION,
    "annualRevenueExVat" DOUBLE PRECISION,
    "annualRevenueIncVat" DOUBLE PRECISION,
    "oneOffPayment" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "pricingHoldUntil" TIMESTAMP(3),
    "contractStart" TIMESTAMP(3),
    "contractEnd" TIMESTAMP(3),
    "probability" INTEGER,
    "xeroSource" "XeroDocSource",
    "xeroDocumentKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChaseEntry" (
    "id" TEXT NOT NULL,
    "serviceQuoteId" TEXT NOT NULL,
    "chaseDate" TIMESTAMP(3) NOT NULL,
    "chasedBy" TEXT NOT NULL,
    "method" TEXT,
    "outcome" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChaseEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveService" (
    "id" TEXT NOT NULL,
    "lsRef" TEXT NOT NULL,
    "sourceServiceQuoteId" TEXT,
    "customerName" TEXT NOT NULL,
    "assetId" TEXT,
    "serviceDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "firmTime" BOOLEAN NOT NULL DEFAULT false,
    "engineerId" TEXT,
    "engineerName" TEXT,
    "team" TEXT,
    "hoursPlanned" DOUBLE PRECISION,
    "outOfServiceRequired" BOOLEAN NOT NULL DEFAULT false,
    "holdRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "accessNotes" TEXT,
    "ramsUploaded" BOOLEAN NOT NULL DEFAULT false,
    "ramsReviewed" BOOLEAN NOT NULL DEFAULT false,
    "inductionRequired" BOOLEAN NOT NULL DEFAULT false,
    "siteAccessTimes" TEXT,
    "parking" TEXT,
    "pasmaRequired" BOOLEAN NOT NULL DEFAULT false,
    "heightRequired" BOOLEAN NOT NULL DEFAULT false,
    "accessAgreed" BOOLEAN NOT NULL DEFAULT false,
    "harnessRequired" BOOLEAN NOT NULL DEFAULT false,
    "cameraRequired" BOOLEAN NOT NULL DEFAULT false,
    "totalComponents" INTEGER NOT NULL DEFAULT 0,
    "toOrderComponents" INTEGER NOT NULL DEFAULT 0,
    "outOfStockComponents" INTEGER NOT NULL DEFAULT 0,
    "estimatedWeight" DOUBLE PRECISION,
    "drawingsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "methodStatement" BOOLEAN NOT NULL DEFAULT false,
    "riskAssessment" BOOLEAN NOT NULL DEFAULT false,
    "prevServiceReport" BOOLEAN NOT NULL DEFAULT false,
    "sitePhotos" BOOLEAN NOT NULL DEFAULT false,
    "accountManager" TEXT,
    "accountNumber" TEXT,
    "outstandingBalance" DOUBLE PRECISION,
    "invoiceStatus" TEXT,
    "poNumber" TEXT,
    "warrantyApproved" BOOLEAN NOT NULL DEFAULT false,
    "creditHold" BOOLEAN NOT NULL DEFAULT false,
    "specNotes" TEXT,
    "specRequiredBy" TIMESTAMP(3),
    "specPriority" TEXT,
    "step4aPlanComplete" BOOLEAN NOT NULL DEFAULT false,
    "step4aEngineerAllocated" BOOLEAN NOT NULL DEFAULT false,
    "step4aSiteRams" BOOLEAN NOT NULL DEFAULT false,
    "step4aComponentsIdentified" BOOLEAN NOT NULL DEFAULT false,
    "step4aEngineeringDocs" BOOLEAN NOT NULL DEFAULT false,
    "step4aFinancialControl" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveProject" (
    "id" TEXT NOT NULL,
    "lqRef" TEXT NOT NULL,
    "stage" "LQStage" NOT NULL DEFAULT 'LQ',
    "sourceQuoteId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "siteAddress" TEXT,
    "siteType" TEXT,
    "supplyType" TEXT,
    "productType" TEXT,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "totalContractValue" DOUBLE PRECISION,
    "paidToDate" DOUBLE PRECISION,
    "vatAmount" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "surveyDate" TIMESTAMP(3),
    "drawingsDue" TIMESTAMP(3),
    "drawingsApprovedDate" TIMESTAMP(3),
    "installationBooked" TIMESTAMP(3),
    "expectedCompletion" TIMESTAMP(3),
    "poReceived" BOOLEAN NOT NULL DEFAULT false,
    "drawingsReceived" BOOLEAN NOT NULL DEFAULT false,
    "depositPaid" BOOLEAN NOT NULL DEFAULT false,
    "surveyBooked" BOOLEAN NOT NULL DEFAULT false,
    "contractApproved" BOOLEAN NOT NULL DEFAULT false,
    "signatureData" TEXT,
    "surveyCompletionDate" TIMESTAMP(3),
    "surveyStatus" TEXT,
    "surveyorName" TEXT,
    "surveyMethod" TEXT,
    "surveyAccessType" TEXT,
    "surveySignedOff" BOOLEAN NOT NULL DEFAULT false,
    "reviewApprovalDate" TIMESTAMP(3),
    "reviewComments" TEXT,
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "routingDecision" "LQRoutingDecision",
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LQInvoice" (
    "id" TEXT NOT NULL,
    "liveProjectId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3),
    "xeroInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LQInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LQDrawing" (
    "id" TEXT NOT NULL,
    "liveProjectId" TEXT NOT NULL,
    "drawingNumber" TEXT NOT NULL,
    "description" TEXT,
    "status" "DrawingStatus" NOT NULL DEFAULT 'ISSUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LQDrawing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LQInstallationItem" (
    "id" TEXT NOT NULL,
    "liveProjectId" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "installationDate" TIMESTAMP(3),
    "commissionDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LQInstallationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LQComponent" (
    "id" TEXT NOT NULL,
    "liveProjectId" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "stockStatus" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "cost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LQComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteRef" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'NEW',
    "enquirySource" "EnquirySource",
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "siteAddress" TEXT,
    "siteType" TEXT,
    "supplyType" TEXT,
    "productType" TEXT,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "nextAction" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "assigneeName" TEXT,
    "probabilityScore" INTEGER,
    "orderValue" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "assetRef" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'UNKNOWN',
    "priority" "AssetPriority" NOT NULL DEFAULT 'NORMAL',
    "lqId" TEXT,
    "isExternalSource" BOOLEAN NOT NULL DEFAULT false,
    "customerName" TEXT,
    "siteName" TEXT,
    "siteAddress" TEXT,
    "systemType" TEXT,
    "firingRating" TEXT,
    "locationOnSite" TEXT,
    "headboxSize" TEXT,
    "motorType" TEXT,
    "controlPanelType" TEXT,
    "mccType" TEXT,
    "driveType" TEXT,
    "motorMake" TEXT,
    "serialNumber" TEXT,
    "manufactureDate" TIMESTAMP(3),
    "warrantyExpiry" TIMESTAMP(3),
    "fabricType" TEXT,
    "fabricColour" TEXT,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "serviceFrequencyMonths" INTEGER,
    "lastServiceDate" TIMESTAMP(3),
    "nextServiceDate" TIMESTAMP(3),
    "renewalAlertDate" TIMESTAMP(3),
    "accessRestrictions" BOOLEAN NOT NULL DEFAULT false,
    "permitsRequired" BOOLEAN NOT NULL DEFAULT false,
    "dchiRequired" BOOLEAN NOT NULL DEFAULT false,
    "securityClearance" BOOLEAN NOT NULL DEFAULT false,
    "loadingBay" BOOLEAN NOT NULL DEFAULT false,
    "laddersRequired" BOOLEAN NOT NULL DEFAULT false,
    "inductionRequired" BOOLEAN NOT NULL DEFAULT false,
    "lastQuoteDate" TIMESTAMP(3),
    "lastContactDate" TIMESTAMP(3),
    "nextCloseDate" TIMESTAMP(3),
    "contractValue" DOUBLE PRECISION,
    "annualRevenue" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetContact" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetServiceEvent" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "engineerId" TEXT,
    "engineerName" TEXT,
    "company" TEXT,
    "summary" TEXT,
    "statusLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetServiceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemName" TEXT,
    "reference" TEXT,
    "itemQuantity" INTEGER,
    "width" INTEGER,
    "drop" INTEGER,
    "cost" DOUBLE PRECISION,
    "production" BOOLEAN NOT NULL DEFAULT false,
    "extras" JSONB NOT NULL DEFAULT '[]',
    "productionSpecification" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionPack" (
    "id" TEXT NOT NULL,
    "packRef" TEXT NOT NULL,
    "liveProjectId" TEXT,
    "liveServiceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "distributionType" "DistributionType",
    "sentToStage5At" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionSystem" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "systemIndex" INTEGER NOT NULL DEFAULT 1,
    "family" "SystemFamily",
    "variant" TEXT,
    "widthMm" INTEGER,
    "heightMm" INTEGER,
    "customerSupplied" BOOLEAN NOT NULL DEFAULT false,
    "addManual" BOOLEAN NOT NULL DEFAULT false,
    "addWarrantyCard" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "cuttingList" JSONB,
    "accessories" JSONB,
    "qrCodeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManufacturingJob" (
    "id" TEXT NOT NULL,
    "mfgRef" TEXT NOT NULL,
    "source" "MfgSource" NOT NULL DEFAULT 'LG',
    "status" "MfgStatus" NOT NULL DEFAULT 'BOOKING_PRODUCTION',
    "packId" TEXT,
    "liveProjectId" TEXT,
    "liveServiceId" TEXT,
    "customerName" TEXT,
    "siteName" TEXT,
    "description" TEXT,
    "priority" TEXT,
    "requiredByDate" TIMESTAMP(3),
    "engineerName" TEXT,
    "specNotes" TEXT,
    "specRequiredBy" TIMESTAMP(3),
    "specPriority" TEXT,
    "approvedBy" TEXT,
    "authorisedBy" TEXT,
    "allComponentsDone" BOOLEAN NOT NULL DEFAULT false,
    "qcFormsUploaded" BOOLEAN NOT NULL DEFAULT false,
    "stampChecked" BOOLEAN NOT NULL DEFAULT false,
    "productionDocsDone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManufacturingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfgComponent" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ComponentStatus" NOT NULL DEFAULT 'AWAITING_STOCK_OUT',
    "category" TEXT,
    "requiredByDate" TIMESTAMP(3),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MfgComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfgFabricRow" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "systemRef" TEXT,
    "widthMm" INTEGER,
    "dropMm" INTEGER,
    "material" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MfgFabricRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MfgQcCheckpoint" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MfgQcCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionJob" (
    "id" TEXT NOT NULL,
    "djRef" TEXT NOT NULL,
    "distributionType" "DistributionType" NOT NULL,
    "mfgJobId" TEXT,
    "liveProjectId" TEXT,
    "liveServiceId" TEXT,
    "customerName" TEXT,
    "siteName" TEXT,
    "accountsReleaseApproved" BOOLEAN NOT NULL DEFAULT false,
    "accountsReleaseApprovedBy" TEXT,
    "packMccCert" BOOLEAN NOT NULL DEFAULT false,
    "packCurtainScope" BOOLEAN NOT NULL DEFAULT false,
    "packFiringLicence" BOOLEAN NOT NULL DEFAULT false,
    "packLabelsId" BOOLEAN NOT NULL DEFAULT false,
    "packControllersManual" BOOLEAN NOT NULL DEFAULT false,
    "packWarrantyCert" BOOLEAN NOT NULL DEFAULT false,
    "collectionSignature" TEXT,
    "collectedAt" TIMESTAMP(3),
    "collectionRep" TEXT,
    "pocGenerated" BOOLEAN NOT NULL DEFAULT false,
    "despatchDate" TIMESTAMP(3),
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "palletBoxCount" INTEGER,
    "trackingLink" TEXT,
    "despatchNotes" TEXT,
    "deliveryMccCert" BOOLEAN NOT NULL DEFAULT false,
    "deliveryCurtainScope" BOOLEAN NOT NULL DEFAULT false,
    "deliveryFiringLicence" BOOLEAN NOT NULL DEFAULT false,
    "deliveryLabelsId" BOOLEAN NOT NULL DEFAULT false,
    "deliveryControllersManual" BOOLEAN NOT NULL DEFAULT false,
    "deliveryWarrantyCert" BOOLEAN NOT NULL DEFAULT false,
    "deliverySignature" TEXT,
    "deliverySignedOffAt" TIMESTAMP(3),
    "podGenerated" BOOLEAN NOT NULL DEFAULT false,
    "courierName" TEXT,
    "driverName" TEXT,
    "ramsUploaded" BOOLEAN NOT NULL DEFAULT false,
    "ramsReviewed" BOOLEAN NOT NULL DEFAULT false,
    "dateIn" TIMESTAMP(3),
    "daysOnSite" INTEGER,
    "estimatedCompletion" TIMESTAMP(3),
    "extendedFlag" BOOLEAN NOT NULL DEFAULT false,
    "returnVisit" BOOLEAN NOT NULL DEFAULT false,
    "ramsFiledChecked" BOOLEAN NOT NULL DEFAULT false,
    "teamSignedOffChecked" BOOLEAN NOT NULL DEFAULT false,
    "customerSignoffUploaded" BOOLEAN NOT NULL DEFAULT false,
    "handoverPackIssued" BOOLEAN NOT NULL DEFAULT false,
    "returnVisitResolved" BOOLEAN NOT NULL DEFAULT false,
    "commissionDate" TIMESTAMP(3),
    "awaitingInvoice" BOOLEAN NOT NULL DEFAULT false,
    "certificatesReleased" BOOLEAN NOT NULL DEFAULT false,
    "certificateReleasedBy" TEXT,
    "djStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistributionJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstallationEngineer" (
    "id" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "engineerName" TEXT NOT NULL,
    "engineerId" TEXT,
    "signOnTime" TEXT,
    "overnight" BOOLEAN NOT NULL DEFAULT false,
    "miles" DOUBLE PRECISION,
    "travelCost" DOUBLE PRECISION,
    "nightRate" DOUBLE PRECISION,
    "offSpecRate" DOUBLE PRECISION,
    "hotelCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstallationEngineer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMilestone" (
    "id" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "triggerEvent" TEXT,
    "status" "PaymentMilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstallationProgressStep" (
    "id" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "stepDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstallationProgressStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistributionDocument" (
    "id" TEXT NOT NULL,
    "djId" TEXT NOT NULL,
    "docType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "s3Key" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DistributionDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StageTransitionLog_recordId_recordType_idx" ON "StageTransitionLog"("recordId", "recordType");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceQuote_sQuoteRef_key" ON "ServiceQuote"("sQuoteRef");

-- CreateIndex
CREATE UNIQUE INDEX "LiveService_lsRef_key" ON "LiveService"("lsRef");

-- CreateIndex
CREATE UNIQUE INDEX "LiveProject_lqRef_key" ON "LiveProject"("lqRef");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteRef_key" ON "Quote"("quoteRef");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetRef_key" ON "Asset"("assetRef");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionPack_packRef_key" ON "ProductionPack"("packRef");

-- CreateIndex
CREATE UNIQUE INDEX "ManufacturingJob_mfgRef_key" ON "ManufacturingJob"("mfgRef");

-- CreateIndex
CREATE UNIQUE INDEX "ManufacturingJob_packId_key" ON "ManufacturingJob"("packId");

-- CreateIndex
CREATE UNIQUE INDEX "DistributionJob_djRef_key" ON "DistributionJob"("djRef");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChaseEntry" ADD CONSTRAINT "ChaseEntry_serviceQuoteId_fkey" FOREIGN KEY ("serviceQuoteId") REFERENCES "ServiceQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LQInvoice" ADD CONSTRAINT "LQInvoice_liveProjectId_fkey" FOREIGN KEY ("liveProjectId") REFERENCES "LiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LQDrawing" ADD CONSTRAINT "LQDrawing_liveProjectId_fkey" FOREIGN KEY ("liveProjectId") REFERENCES "LiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LQInstallationItem" ADD CONSTRAINT "LQInstallationItem_liveProjectId_fkey" FOREIGN KEY ("liveProjectId") REFERENCES "LiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LQComponent" ADD CONSTRAINT "LQComponent_liveProjectId_fkey" FOREIGN KEY ("liveProjectId") REFERENCES "LiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetContact" ADD CONSTRAINT "AssetContact_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetServiceEvent" ADD CONSTRAINT "AssetServiceEvent_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionSystem" ADD CONSTRAINT "ProductionSystem_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ProductionPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingJob" ADD CONSTRAINT "ManufacturingJob_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ProductionPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfgComponent" ADD CONSTRAINT "MfgComponent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ManufacturingJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfgFabricRow" ADD CONSTRAINT "MfgFabricRow_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ManufacturingJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MfgQcCheckpoint" ADD CONSTRAINT "MfgQcCheckpoint_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ManufacturingJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstallationEngineer" ADD CONSTRAINT "InstallationEngineer_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DistributionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMilestone" ADD CONSTRAINT "PaymentMilestone_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DistributionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstallationProgressStep" ADD CONSTRAINT "InstallationProgressStep_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DistributionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistributionDocument" ADD CONSTRAINT "DistributionDocument_djId_fkey" FOREIGN KEY ("djId") REFERENCES "DistributionJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
