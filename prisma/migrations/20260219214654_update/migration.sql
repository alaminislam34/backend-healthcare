/*
  Warnings:

  - The primary key for the `doctor_specialties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[doctorId,specialtyId]` on the table `doctor_specialties` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `doctor_specialties` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "doctor_specialties" DROP CONSTRAINT "doctor_specialties_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "doctor_specialties_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_specialties_doctorId_specialtyId_key" ON "doctor_specialties"("doctorId", "specialtyId");
