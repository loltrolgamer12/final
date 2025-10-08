/*
  Warnings:

  - Added the required column `baterias` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `botiquin` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `copas_pernos` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correas` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentacion` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `equipo_carretera` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `extintor` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gps` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `indicadores` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kit_ambiental` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `llanta_repuesto` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `llantas_labrado` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `llantas_sin_cortes` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_aceite_motor` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_fluido_dir_hidraulica` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_fluido_frenos` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_fluido_limpia_parabrisas` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivel_fluido_refrigerante` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `objetos_sueltos` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pito` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentacion_aseo` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suspension` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tapa_tanque` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tapiceria` to the `Inspeccion` table without a default value. This is not possible if the table is not empty.
  - Made the column `altas_bajas` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `direccionales` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `parqueo` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `freno` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `reversa_alarma` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `espejos` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vidrio_frontal` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `presentacion_aseo` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pito` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gps` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cinturones` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `puertas` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vidrios` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `limpiaparabrisas` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `extintor` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `botiquin` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tapiceria` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `indicadores` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `objetos_sueltos` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `frenos` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `frenos_emergencia` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fugas_aire` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `control_fugas_aire` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `candados_bandas` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `acoples_tomas` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivel_aceite_motor` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivel_fluido_frenos` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivel_fluido_dir_hidraulica` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivel_fluido_refrigerante` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nivel_fluido_limpia_parabrisas` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correas` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `baterias` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `llantas_labrado` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `llantas_sin_cortes` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `llanta_repuesto` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `copas_pernos` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `suspension` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `direccion` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tapa_tanque` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `equipo_carretera` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kit_ambiental` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `documentacion` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `horas_sueno_suficientes` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `libre_sintomas_fatiga` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `condiciones_aptas` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `consumo_medicamentos` on table `InspeccionPesado` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Inspeccion" ADD COLUMN     "baterias" BOOLEAN NOT NULL,
ADD COLUMN     "botiquin" BOOLEAN NOT NULL,
ADD COLUMN     "copas_pernos" BOOLEAN NOT NULL,
ADD COLUMN     "correas" BOOLEAN NOT NULL,
ADD COLUMN     "direccion" BOOLEAN NOT NULL,
ADD COLUMN     "documentacion" BOOLEAN NOT NULL,
ADD COLUMN     "equipo_carretera" BOOLEAN NOT NULL,
ADD COLUMN     "extintor" BOOLEAN NOT NULL,
ADD COLUMN     "gps" BOOLEAN NOT NULL,
ADD COLUMN     "indicadores" BOOLEAN NOT NULL,
ADD COLUMN     "kit_ambiental" BOOLEAN NOT NULL,
ADD COLUMN     "llanta_repuesto" BOOLEAN NOT NULL,
ADD COLUMN     "llantas_labrado" BOOLEAN NOT NULL,
ADD COLUMN     "llantas_sin_cortes" BOOLEAN NOT NULL,
ADD COLUMN     "nivel_aceite_motor" BOOLEAN NOT NULL,
ADD COLUMN     "nivel_fluido_dir_hidraulica" BOOLEAN NOT NULL,
ADD COLUMN     "nivel_fluido_frenos" BOOLEAN NOT NULL,
ADD COLUMN     "nivel_fluido_limpia_parabrisas" BOOLEAN NOT NULL,
ADD COLUMN     "nivel_fluido_refrigerante" BOOLEAN NOT NULL,
ADD COLUMN     "objetos_sueltos" BOOLEAN NOT NULL,
ADD COLUMN     "pito" BOOLEAN NOT NULL,
ADD COLUMN     "presentacion_aseo" BOOLEAN NOT NULL,
ADD COLUMN     "suspension" BOOLEAN NOT NULL,
ADD COLUMN     "tapa_tanque" BOOLEAN NOT NULL,
ADD COLUMN     "tapiceria" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "InspeccionPesado" ALTER COLUMN "altas_bajas" SET NOT NULL,
ALTER COLUMN "direccionales" SET NOT NULL,
ALTER COLUMN "parqueo" SET NOT NULL,
ALTER COLUMN "freno" SET NOT NULL,
ALTER COLUMN "reversa_alarma" SET NOT NULL,
ALTER COLUMN "espejos" SET NOT NULL,
ALTER COLUMN "vidrio_frontal" SET NOT NULL,
ALTER COLUMN "presentacion_aseo" SET NOT NULL,
ALTER COLUMN "pito" SET NOT NULL,
ALTER COLUMN "gps" SET NOT NULL,
ALTER COLUMN "cinturones" SET NOT NULL,
ALTER COLUMN "puertas" SET NOT NULL,
ALTER COLUMN "vidrios" SET NOT NULL,
ALTER COLUMN "limpiaparabrisas" SET NOT NULL,
ALTER COLUMN "extintor" SET NOT NULL,
ALTER COLUMN "botiquin" SET NOT NULL,
ALTER COLUMN "tapiceria" SET NOT NULL,
ALTER COLUMN "indicadores" SET NOT NULL,
ALTER COLUMN "objetos_sueltos" SET NOT NULL,
ALTER COLUMN "frenos" SET NOT NULL,
ALTER COLUMN "frenos_emergencia" SET NOT NULL,
ALTER COLUMN "fugas_aire" SET NOT NULL,
ALTER COLUMN "control_fugas_aire" SET NOT NULL,
ALTER COLUMN "candados_bandas" SET NOT NULL,
ALTER COLUMN "acoples_tomas" SET NOT NULL,
ALTER COLUMN "nivel_aceite_motor" SET NOT NULL,
ALTER COLUMN "nivel_fluido_frenos" SET NOT NULL,
ALTER COLUMN "nivel_fluido_dir_hidraulica" SET NOT NULL,
ALTER COLUMN "nivel_fluido_refrigerante" SET NOT NULL,
ALTER COLUMN "nivel_fluido_limpia_parabrisas" SET NOT NULL,
ALTER COLUMN "correas" SET NOT NULL,
ALTER COLUMN "baterias" SET NOT NULL,
ALTER COLUMN "llantas_labrado" SET NOT NULL,
ALTER COLUMN "llantas_sin_cortes" SET NOT NULL,
ALTER COLUMN "llanta_repuesto" SET NOT NULL,
ALTER COLUMN "copas_pernos" SET NOT NULL,
ALTER COLUMN "suspension" SET NOT NULL,
ALTER COLUMN "direccion" SET NOT NULL,
ALTER COLUMN "tapa_tanque" SET NOT NULL,
ALTER COLUMN "equipo_carretera" SET NOT NULL,
ALTER COLUMN "kit_ambiental" SET NOT NULL,
ALTER COLUMN "documentacion" SET NOT NULL,
ALTER COLUMN "horas_sueno_suficientes" SET NOT NULL,
ALTER COLUMN "libre_sintomas_fatiga" SET NOT NULL,
ALTER COLUMN "condiciones_aptas" SET NOT NULL,
ALTER COLUMN "consumo_medicamentos" SET NOT NULL;

-- AlterTable
ALTER TABLE "RechazoInspeccion" ADD COLUMN     "baterias" BOOLEAN,
ADD COLUMN     "botiquin" BOOLEAN,
ADD COLUMN     "copas_pernos" BOOLEAN,
ADD COLUMN     "correas" BOOLEAN,
ADD COLUMN     "direccion" BOOLEAN,
ADD COLUMN     "documentacion" BOOLEAN,
ADD COLUMN     "equipo_carretera" BOOLEAN,
ADD COLUMN     "extintor" BOOLEAN,
ADD COLUMN     "gps" BOOLEAN,
ADD COLUMN     "indicadores" BOOLEAN,
ADD COLUMN     "kit_ambiental" BOOLEAN,
ADD COLUMN     "llanta_repuesto" BOOLEAN,
ADD COLUMN     "llantas_labrado" BOOLEAN,
ADD COLUMN     "llantas_sin_cortes" BOOLEAN,
ADD COLUMN     "nivel_aceite_motor" BOOLEAN,
ADD COLUMN     "nivel_fluido_dir_hidraulica" BOOLEAN,
ADD COLUMN     "nivel_fluido_frenos" BOOLEAN,
ADD COLUMN     "nivel_fluido_limpia_parabrisas" BOOLEAN,
ADD COLUMN     "nivel_fluido_refrigerante" BOOLEAN,
ADD COLUMN     "objetos_sueltos" BOOLEAN,
ADD COLUMN     "pito" BOOLEAN,
ADD COLUMN     "presentacion_aseo" BOOLEAN,
ADD COLUMN     "suspension" BOOLEAN,
ADD COLUMN     "tapa_tanque" BOOLEAN,
ADD COLUMN     "tapiceria" BOOLEAN;
