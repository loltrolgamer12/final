const app = require('./src/config/app');
const prisma = require('./src/config/database');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor HQ-FO-40 escuchando en puerto ${PORT}`);
});
