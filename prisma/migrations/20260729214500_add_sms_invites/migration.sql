-- CreateTable
CREATE TABLE "SmsInvite" (
    "id" TEXT NOT NULL,
    "fellowshipId" TEXT NOT NULL,
    "sentById" TEXT NOT NULL,
    "phoneHash" TEXT NOT NULL,
    "twilioSid" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsInvite_twilioSid_key" ON "SmsInvite"("twilioSid");

-- CreateIndex
CREATE INDEX "SmsInvite_fellowshipId_idx" ON "SmsInvite"("fellowshipId");

-- CreateIndex
CREATE INDEX "SmsInvite_sentById_createdAt_idx" ON "SmsInvite"("sentById", "createdAt");

-- CreateIndex
CREATE INDEX "SmsInvite_phoneHash_createdAt_idx" ON "SmsInvite"("phoneHash", "createdAt");

-- AddForeignKey
ALTER TABLE "SmsInvite" ADD CONSTRAINT "SmsInvite_fellowshipId_fkey" FOREIGN KEY ("fellowshipId") REFERENCES "Fellowship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsInvite" ADD CONSTRAINT "SmsInvite_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
