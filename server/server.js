const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const { upload } = require('./middlewares/upload');
const sql = require('mssql'); // Asegúrate de tener esto al principio del archivo


const app = express();
const PORT = 5000;

const corsOptions = {
    origin: 'https://ecocommunity-lu3t.vercel.app',  // Permitir solo este origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  // Si necesitas enviar cookies u otras credenciales
};

app.use(cors(corsOptions));

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
