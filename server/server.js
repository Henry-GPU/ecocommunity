const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const { upload } = require('./middlewares/upload');
const sql = require('mssql');


const app = express();
const PORT = 5000;

app.use(cors());

app.use('/uploads', express.static('uploads'));
app.use('/icons', express.static('icons'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', authRoutes);
app.use('/api', postRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
