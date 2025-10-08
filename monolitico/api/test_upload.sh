#!/bin/bash

echo "🚀 Iniciando servidor..."
cd /workspaces/final/monolitico/api
node server.js &
SERVER_PID=$!

echo "⏳ Esperando 5 segundos para que el servidor arranque..."
sleep 5

echo "📤 Subiendo archivo..."
curl -X POST http://localhost:4000/api/upload \
  -F "file=@/workspaces/final/pruebas/HQ-FO-40 INSPECCIÓN DIARIA DE VEHÍCULO LIVIANO. 8-10-2025.xlsx" \
  -F "tipo=ligero" \
  -F "strict=false"

echo ""
echo "🛑 Deteniendo servidor..."
kill $SERVER_PID

echo "✅ Test completado"
