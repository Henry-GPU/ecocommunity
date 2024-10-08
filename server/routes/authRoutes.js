const express = require('express');
const bcrypt = require('bcrypt');
const poolPromise = require('../config/database');
const { upload } = require('../middlewares/upload');
const sql = require('mssql'); // Asegúrate de tener esto al principio del archivo


const router = express.Router();

// Registro
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { email, password, name, birthday } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  try {
    const pool = await poolPromise;
    const hashedPassword = await bcrypt.hash(password, 10);

    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 10) {
      return res.status(400).send({ message: 'Debes tener al menos 10 años para registrarte.' });
    }

    const query = `
      INSERT INTO Usuarios (Nombre, Email, Contraseña, FotoPerfil, FechaNacimiento)
      VALUES (@name, @email, @password, @profilePicture, @birthday)
    `;
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('profilePicture', sql.NVarChar, profilePicture)
      .input('birthday', sql.Date, birthDate)
      .query(query);

    res.status(201).send({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error al registrar el usuario:', err);
    res.status(500).send({ message: 'Error al registrar el usuario' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Datos recibidos para login:', { email, password });
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Usuarios WHERE Email = @email');

    const user = result.recordset[0];
    if (user && await bcrypt.compare(password, user.Contraseña)) {
      res.status(200).send({ message: 'Inicio de sesión exitoso' });
    } else {
      res.status(400).send({ message: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).send({ message: 'Error al iniciar sesión' });
  }
});

// Obtener imagen de perfil
router.get('/get-profile-image', async (req, res) => {
  const email = req.query.email;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT FotoPerfil FROM Usuarios WHERE Email = @email');

    const user = result.recordset[0];
    if (user) {
      res.status(200).send({ profileImage: user.FotoPerfil });
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener la imagen del perfil:', err);
    res.status(500).send({ message: 'Error al obtener la imagen del perfil' });
  }
});

// Obtener nombre de usuario
router.get('/get-user-name', async (req, res) => {
  const email = req.query.userEmail;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT Nombre FROM Usuarios WHERE Email = @email');

    const user = result.recordset[0];
    if (user) {
      res.status(200).send({ userName: user.Nombre });
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener el nombre de usuario:', err);
    res.status(500).send({ message: 'Error al obtener el nombre de usuario' });
  }
});

// Supongamos que tienes un archivo de rutas llamado 'routes.js'
router.get('/get-user-id', async (req, res) => {
  const { email } = req.query; // Obtener el correo del query string

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('email', sql.NVarChar, email);
    const result = await request.query('SELECT Id FROM Usuarios WHERE Email = @email');

    if (result.recordset.length > 0) {
      res.status(200).send({ userId: result.recordset[0].Id });
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error('Error al obtener el ID del usuario:', err);
    res.status(500).send({ message: 'Error al obtener el ID del usuario' });
  }
});



router.put('/update-profile/:userId', upload.single('profilePicture'), async (req, res) => {
  const { userId } = req.params; // Obtener el ID del usuario de la ruta
  const { password, name } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  try {
    const pool = await poolPromise;
    const request = pool.request();

    let query = 'UPDATE Usuarios SET ';
    let hasUpdate = false;

    if (name) {
      query += 'Nombre = @name, ';
      request.input('name', sql.NVarChar, name);
      hasUpdate = true;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += 'Contraseña = @password, ';
      request.input('password', sql.NVarChar, hashedPassword);
      hasUpdate = true;
    }

    if (profilePicture) {
      query += 'FotoPerfil = @profilePicture, ';
      request.input('profilePicture', sql.NVarChar, profilePicture);
      hasUpdate = true;
    }

    // Elimina la coma final
    if (hasUpdate) {
      query = query.slice(0, -2) + ' WHERE Id = @userId'; // Usar el ID para filtrar
      request.input('userId', sql.Int, userId); // Asegúrate de que el tipo de dato es correcto
      await request.query(query);
      res.status(200).send({ message: 'Perfil actualizado con éxito' });
    } else {
      res.status(400).send({ message: 'No hay campos para actualizar' });
    }

  } catch (err) {
    console.error('Error al actualizar el perfil:', err);
    res.status(500).send({ message: 'Error al actualizar el perfil' });
  }
});



module.exports = router;
