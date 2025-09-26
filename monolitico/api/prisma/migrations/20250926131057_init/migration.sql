-- CreateTable
CREATE TABLE "Inspeccion" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "marca_temporal" TIMESTAMP(3) NOT NULL,
    "turno" TEXT NOT NULL,
    "conductor_nombre" TEXT NOT NULL,
    "placa_vehiculo" TEXT NOT NULL,
    "kilometraje" INTEGER NOT NULL,
    "contrato" TEXT NOT NULL,
    "campo_coordinacion" TEXT NOT NULL,
    "consumo_medicamentos" BOOLEAN NOT NULL,
    "horas_sueno_suficientes" BOOLEAN NOT NULL,
    "libre_sintomas_fatiga" BOOLEAN NOT NULL,
    "condiciones_aptas" BOOLEAN NOT NULL,
    "altas_bajas" BOOLEAN NOT NULL,
    "direccionales" BOOLEAN NOT NULL,
    "parqueo" BOOLEAN NOT NULL,
    "freno" BOOLEAN NOT NULL,
    "reversa" BOOLEAN NOT NULL,
    "espejos" BOOLEAN NOT NULL,
    "vidrio_frontal" BOOLEAN NOT NULL,
    "frenos" BOOLEAN NOT NULL,
    "frenos_emergencia" BOOLEAN NOT NULL,
    "cinturones" BOOLEAN NOT NULL,
    "puertas" BOOLEAN NOT NULL,
    "vidrios" BOOLEAN NOT NULL,
    "limpiaparabrisas" BOOLEAN NOT NULL,
    "observaciones" TEXT,
    "nivel_riesgo" TEXT NOT NULL,
    "puntaje_total" INTEGER NOT NULL,
    "puntaje_fatiga" INTEGER NOT NULL,
    "tiene_alertas_criticas" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchivoProcesado" (
    "id" SERIAL NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "hash_archivo" TEXT NOT NULL,
    "tamano_archivo" INTEGER NOT NULL,
    "total_registros" INTEGER NOT NULL,
    "registros_insertados" INTEGER NOT NULL,
    "registros_duplicados" INTEGER NOT NULL,
    "registros_error" INTEGER NOT NULL,
    "tiempo_procesamiento" DOUBLE PRECISION NOT NULL,
    "errores_validacion" JSONB NOT NULL,
    "advertencias" JSONB NOT NULL,
    "fecha_procesamiento" TIMESTAMP(3) NOT NULL,
    "usuario_carga" TEXT NOT NULL,

    CONSTRAINT "ArchivoProcesado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArchivoProcesado_hash_archivo_key" ON "ArchivoProcesado"("hash_archivo");
