/*
  Warnings:

  - A unique constraint covering the columns `[placa_vehiculo,fecha,conductor_nombre]` on the table `Inspeccion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Inspeccion_placa_vehiculo_fecha_conductor_nombre_key" ON "Inspeccion"("placa_vehiculo", "fecha", "conductor_nombre");
