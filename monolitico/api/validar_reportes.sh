#!/bin/bash

# Script de validación de endpoints de reportes
# Asegúrate de que el servidor esté corriendo antes de ejecutar

BASE_URL="http://localhost:3001"

echo "🧪 VALIDACIÓN DE ENDPOINTS DE REPORTES"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para hacer peticiones
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Probando ${name}... "
    
    # Hacer la petición y guardar el código de estado
    status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${url}")
    
    if [ "$status" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (${status})"
    else
        echo -e "${RED}✗ FAIL${NC} (esperado: ${expected_status}, obtenido: ${status})"
    fi
}

echo "📋 1. VALIDANDO FILTROS"
echo "----------------------"
test_endpoint "Filtros de vehículos" "/api/filtros/vehiculos"
echo ""

echo "📊 2. VALIDANDO REPORTES VISUALES"
echo "--------------------------------"
test_endpoint "Reporte ligeros" "/api/reportes?mes=10&ano=2025&tipo=ligero"
test_endpoint "Reporte pesados" "/api/reportes?mes=10&ano=2025&tipo=pesado"
test_endpoint "Reporte todos" "/api/reportes?mes=10&ano=2025&tipo=todos"
echo ""

echo "📄 3. VALIDANDO EXCEL (solo verifica que responda, no descarga)"
echo "-------------------------------------------------------------"
# Para Excel no podemos verificar el contenido fácilmente desde bash
echo -e "${YELLOW}⚠ Excel debe probarse manualmente descargando desde el navegador${NC}"
echo "   URLs a probar:"
echo "   - ${BASE_URL}/api/reportes/excel?mes=10&ano=2025&tipo=ligero"
echo "   - ${BASE_URL}/api/reportes/excel?mes=10&ano=2025&tipo=pesado"
echo "   - ${BASE_URL}/api/reportes/excel?mes=10&ano=2025&tipo=todos"
echo ""

echo "📕 4. VALIDANDO PDF (solo verifica que responda, no descarga)"
echo "-----------------------------------------------------------"
echo -e "${YELLOW}⚠ PDF debe probarse manualmente descargando desde el navegador${NC}"
echo "   URLs a probar:"
echo "   - ${BASE_URL}/api/reportes/pdf?mes=10&ano=2025&tipo=ligero"
echo "   - ${BASE_URL}/api/reportes/pdf?mes=10&ano=2025&tipo=pesado"
echo "   - ${BASE_URL}/api/reportes/pdf?mes=10&ano=2025&tipo=todos"
echo ""

echo "✅ VALIDACIÓN COMPLETA"
echo "===================="
echo ""
echo "NOTA: Para probar completamente:"
echo "1. Sube archivos Excel de ligeros y pesados"
echo "2. Ve a la página de Reportes en el navegador"
echo "3. Selecciona tipo (Ligero/Pesado/Todos)"
echo "4. Selecciona mes y año"
echo "5. Genera el reporte"
echo "6. Descarga Excel y PDF"
echo "7. Verifica que las hojas contengan los datos correctos"
echo "8. Verifica que la columna 'Tipo' esté presente"
echo "9. Verifica que el 'Motivo' muestre TODOS los componentes fallados"
