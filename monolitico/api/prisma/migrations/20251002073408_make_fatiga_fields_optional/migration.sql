-- AlterTable
ALTER TABLE "InspeccionPesado" ALTER COLUMN "horas_sueno_suficientes" DROP NOT NULL,
ALTER COLUMN "libre_sintomas_fatiga" DROP NOT NULL,
ALTER COLUMN "condiciones_aptas" DROP NOT NULL,
ALTER COLUMN "consumo_medicamentos" DROP NOT NULL;
