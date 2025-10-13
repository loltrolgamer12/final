#!/bin/bash

echo "🏗️  INICIANDO SISTEMA MONOLÍTICO HQ-FO-40"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd /workspaces/final/monolitico

echo -e "${BLUE}📦 Paso 1: Instalando dependencias del frontend...${NC}"
cd src
npm install --silent
echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

echo -e "${BLUE}🔨 Paso 2: Compilando frontend React...${NC}"
npm run build
echo -e "${GREEN}✅ Build completado${NC}"
echo ""

echo -e "${BLUE}📂 Paso 3: Copiando build al servidor...${NC}"
cd ..
rm -rf api/public/build
cp -r src/build api/public/build
echo -e "${GREEN}✅ Archivos copiados${NC}"
echo ""

echo -e "${BLUE}🔍 Paso 4: Verificando estructura...${NC}"
if [ -f "api/public/build/index.html" ]; then
    echo -e "${GREEN}✅ index.html encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  index.html NO encontrado${NC}"
    exit 1
fi

if [ -d "api/public/build/static" ]; then
    echo -e "${GREEN}✅ Carpeta static encontrada${NC}"
else
    echo -e "${YELLOW}⚠️  Carpeta static NO encontrada${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}✨ BUILD COMPLETADO EXITOSAMENTE${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🚀 INICIANDO SERVIDOR MONOLÍTICO...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}📡 Servidor escuchando en: http://localhost:4000${NC}"
echo -e "${GREEN}🌐 Frontend + Backend en un solo puerto${NC}"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar servidor
npm start
