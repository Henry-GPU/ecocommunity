const express = require('express');
const bcrypt = require('bcrypt');
const poolPromise = require('../config/database');
const { upload } = require('../middlewares/upload');
const axios = require('axios');
const sql = require('mssql'); // Asegúrate de tener esto al principio del archivo
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});


const router = express.Router();

// Registro
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { email, username, password, name, birthday } = req.body;
  const profilePicture = req.file ? req.file.filename : null;
  const role = 6;
  console.log(email, username, password, name, birthday);

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

    // Iniciar la transacción
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Inserta el usuario en la base de datos
      const queryUser = `
        INSERT INTO [User] ([Name], [User_Name], [Email], [Password], [Birthdate])
        OUTPUT INSERTED.[Id]
        VALUES (@name, @username, @email, @password, @birthday);
      `;
      const result = await transaction.request()
        .input('name', sql.NVarChar, name)
        .input('username', sql.NVarChar, username)
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashedPassword)
        .input('birthday', sql.Date, birthDate)
        .query(queryUser);

      // Obtener el UserId después de la inserción
      const userId = result.recordset[0].Id;
      console.log(email, username, hashedPassword, name, birthday);
      console.log('UserId después de la inserción:', userId);

      if (!userId) {
        throw new Error('UserId is undefined or null');
      }

      const queryRole = `
        INSERT INTO [User_Role] ([User], [Role])
        VALUES (@userId, @role);
        `;
      
        await transaction.request()
          .input('userId', sql.Int, userId)
          .input('role', sql.Int, role)
          .query(queryRole);


      // Si hay una imagen, inserta la imagen del usuario
      if (profilePicture) {
        const queryImage = `
          INSERT INTO [User_Image] ([Path], [User])
          VALUES (@profilePicture, @userId);
        `;
        await transaction.request()
          .input('profilePicture', sql.NVarChar, profilePicture)
          .input('userId', sql.Int, userId)
          .query(queryImage);
      }

      // Confirmar la transacción
      await transaction.commit();
      res.status(200).send({ message: 'Usuario registrado con éxito' });
    } catch (err) {
      // Si algo falla, revertir la transacción
      await transaction.rollback();
      console.error('Error en la transacción:', err);
      res.status(500).send({ message: 'Error al registrar el usuario' });
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    res.status(500).send({ message: 'Error al conectar a la base de datos' });
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
      .query(`SELECT * FROM [User] 
              WHERE [Email] = @email`);

    const user = result.recordset[0];
    const statusResult = await pool.request()
    .input('email', sql.NVarChar, email)
    .query(`SELECT [Is_Active] AS [Status]
            FROM [User] 
            WHERE [Email] = @email`);

    const userStatus = statusResult.recordset[0]; 
    const resultRole = await pool.request()
    .input('email', sql.NVarChar, email)
    .query(`SELECT [Role].[Id],[Role].[Name] AS [Role]
            FROM [User_Role]
            JOIN [User] ON [User].[Id] = [User_Role].[User]
            JOIN [Role] ON [Role].[Id] = [User_Role].[Role]
            WHERE [User].[Email] = @email`);
    const role = resultRole.recordset[0];
    console.log(`Rol obtenido: Id=${role.Id} Rol=${role.Role}`);
    if (user && await bcrypt.compare(password, user.Password)) {
      return res.status(200).json({ 
        message: 'Inicio de sesión exitoso',
        role: role.Id,
        roleName: role.Role,
        status: userStatus.Status
      });
    } else {
      res.status(400).send({ message: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error al iniciar sesión:', err);
    res.status(500).send({ message: 'Error al iniciar sesión' });
  }
});

router.post('/create-community', upload.single('communityPicture'), async(req, res) => {
  const { userEmail, name, description, state, city } = req.body;
  const communityPicture = req.file ? req.file.filename : null;
  const country = 'Guatemala';
  const communityRole = 1
  try {
    const responseUserId = await axiosInstance.get('/get-user-id', {
      params: { email: userEmail }
    });
    const userId = responseUserId.data.userId;
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();
    try {
      const queryCommunity = `
      INSERT INTO [Community]([Name], [Description], [Country], [State], [City])
      OUTPUT INSERTED.[Id]
      VALUES (@name, @description, @country, @state, @city);`;


      const result = await transaction.request()
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('country', sql.NVarChar, country)
      .input('state', sql.NVarChar, state)
      .input('city', sql.NVarChar, city)
      .query(queryCommunity);

    const communityId = result.recordset[0].Id;
    console.log(communityId, name, description, country, city, state,);

    if(!communityId){
      throw new Error('Community Id is undefined or null');
    }

    const queryRole = `
        INSERT INTO [User_Community_Role] ([User], [Community], [Role])
        VALUES (@userId, @communityId, @communityRole);
        `;

    await transaction.request()
        .input('userId', sql.Int, userId)
        .input('communityId', sql.Int, communityId)
        .input('communityRole', sql.Int, communityRole)
          .query(queryRole);

      if(communityPicture){
        const queryImage = `
        INSERT INTO [Community_Image] ([Path], [Community])
        VALUES (@communityPicture, @communityId);
      `;
      await transaction.request()
        .input('communityPicture', sql.NVarChar, communityPicture)
        .input('communityId', sql.Int, communityId)
        .query(queryImage);
      }
      await transaction.commit();
      res.status(200).send({ message: 'Comunidad creada con éxito' });
    } catch (error) {
      await transaction.rollback();
      console.error('Error en la transacción:', error);
      res.status(500).send({ message: 'Error al crear la comunidad' });
    }
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).send({ message: 'Error al conectar a la base de datos' });
  }
});

router.post('/join-community', async (req, res) => {
  const { email, community, communityRole } = req.body;
  
  try {
    const responseUserId = await axiosInstance.get('/get-user-id', {
      params: { email: email }
    });
    const userId = responseUserId.data.userId;
    const pool = await poolPromise;

    const checkIfJoined = await pool.request()
      .input('userId', sql.Int, userId)
      .input('communityId', sql.Int, community)
      .query(`SELECT COUNT(*) AS count FROM [User_Community_Role]
              WHERE [User] = @userId AND [Community] = @communityId`);

    const alreadyJoined = checkIfJoined.recordset[0].count > 0;

    if (alreadyJoined) {
  
      return res.status(200).json({ message: 'Ya eres miembro de esta comunidad.' });
    }

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('communityId', sql.Int, community)
      .input('communityRole', sql.Int, communityRole)
      .query(`INSERT INTO [User_Community_Role]
              ([User], [Community], [Role])
              VALUES (@userId, @communityId, @communityRole)`);

    res.status(200).json({ message: 'Te has unido a la comunidad exitosamente.' });
  
  } catch (error) {
    console.error('Error al unirse a la comunidad:', error);
    res.status(500).json({ message: 'Ocurrió un error al intentar unirse a la comunidad.' });
  }
});

router.get('/get-profile-image', async (req, res) => {
  const email = req.query.email;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`SELECT [User_Image].[Path]
        FROM [User_Image]
        JOIN [User] 
        ON [User_Image].[User] = [User].[Id]
        WHERE [User].[Email] = @email
        AND [User_Image].[Is_Active] = 1`);

    const user = result.recordset[0];
    if (user) {
      res.status(200).send({ profileImage: user.Path });
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
      .query('SELECT [User_Name] FROM [User] WHERE [Email] = @email');

    const user = result.recordset[0];
    if (user) {
      res.status(200).send({ userName: user.User_Name });
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
  const { email } = req.query;

  // Verificar si el correo está definido
  if (!email) {
    return res.status(400).send({ message: 'El correo electrónico es requerido' });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.input('email', sql.NVarChar, email);
    const result = await request.query('SELECT [Id] FROM [User] WHERE [Email] = @email');

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

router.get('/get-users', async(req, res) =>{
  try {
    const pool = await poolPromise;
    const result = await pool.request()
    .query(`SELECT 
            [User].[Id],
            [User].[User_Name],
            [User].[Email],
            [User_Image].[Path] AS [User_Photo],
            [Role].[Name] AS [Role]
            FROM [User]
            LEFT JOIN [User_Image] ON [User_Image].[User] = [User].[Id]
            LEFT JOIN [User_Role] ON [User_Role].[User] = [User].[Id]
            LEFT JOIN [Role] ON [User_Role].[Role] = [Role].[Id]
            WHERE [User_Image].[Is_Active] = 1
          `)
    const users = result.recordset;
    res.status(200).json(users);
  } 
  catch (error) {
    console.error('Error al obtener los usuarios', error);
    res.status(500).json({message: 'Error al obtener los usuarios', error});
  }
});

router.get('/get-all-communities', async(req, res) =>{
  try {
    const pool = await poolPromise;
    const result = await pool.request()
    .query(`SELECT 
            [Community].[Id],
            [Community].[Name],
            [Community].[Country],
            [Community].[State],
            [Community].[City]
            FROM [Community]
          `)
    const users = result.recordset;
    res.status(200).json(users);
  } 
  catch (error) {
    console.error('Error al obtener los usuarios', error);
    res.status(500).json({message: 'Error al obtener los usuarios', error});
  }
});

router.get('/user-communities', async(req, res) => {
  const { userEmail } = req.query;
  try {
    const responseUserId = await axiosInstance.get('/get-user-id', {
      params: {
        email: userEmail
      }
    });
    const userId = responseUserId.data.userId;
    const pool = await poolPromise;
    const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`SELECT [Community].[Name], [Community].[Id]
            FROM [Community]
            LEFT JOIN [User_Community_Role] 
              ON [User_Community_Role].[Community] = [Community].[Id]
            LEFT JOIN [User]
              ON [User].[Id] = [User_Community_Role].[User]
            WHERE [User].[Id] = @userId`);
    const communities = result.recordset;
    res.status(200).json(communities);
  } 
  catch (error) {
    console.error('Error al obtener las comunidades', error);
    res.status(500).json({message: 'Error al obtener las comunidades', error});
  }


});

router.get('/get-communities', async(req, res) =>{
  const { userEmail } = req.query;
  try {
    const responseUserId = await axiosInstance.get('/get-user-id', {
      params: {
        email: userEmail
      }
    });
    const userId = responseUserId.data.userId;
    const pool = await poolPromise;
    const result = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`SELECT [Community].*, 
              COUNT([AllUsers].[User]) AS [nMembers], 
			        [Community_Image].[Path] AS [Image]
          FROM [Community]
          LEFT JOIN [Community_Image]
            ON [Community_Image].[Community] = [Community].[Id]
          LEFT JOIN [User_Community_Role] 
            ON [Community].[Id] = [User_Community_Role].[Community]
            AND [User_Community_Role].[User] = @userId
          LEFT JOIN [User_Community_Role] AS [AllUsers] 
            ON [Community].[Id] = [AllUsers].[Community] 
          WHERE [User_Community_Role].[Id] IS NULL 
          GROUP BY [Community].[Id], 
            [Community].[Name], 
            [Community].[Country], 
            [Community].[State], 
            [Community].[City], 
            [Community].[Description], 
            [Community].[CreatedAt],
			      [Community_Image].[Path],
            ORDER BY [Community].[Name] ASC;
          `)
    const communities = result.recordset;
    res.status(200).json(communities);
  } 
  catch (error) {
    console.error('Error al obtener las comunidades', error);
    res.status(500).json({message: 'Error al obtener las comunidades', error});
  }
});

router.get('/user-info', async (req, res) => {
  const id = req.query.id;
  try {
    const pool = await poolPromise;
    const request = await pool.request()
    .input('userId', sql.Int, id)
    .query(`SELECT [User].[Name],
	          [User].[User_Name],
	          [User].[Email],
	          [User_Image].[Path] AS [User_Image],
	          [Role].[Name] AS [User_Role],
            [User].[Is_Active] AS [Status]
            FROM [User]
            JOIN [User_Image] ON [User].[Id] = [User_Image].[User]
            JOIN [User_Role] ON [User].[Id] = [User_Role].[User]
            JOIN [Role] ON [User_Role].[Role] = [Role].[Id]
            WHERE [User].[Id] = @userId
            AND [User_Image].[Is_Active] = 1`);

    const usuario = request.recordset;
    res.status(200).json(usuario);
  }catch{
  
  }
});

router.put('/change-status', async (req, res) => {
  const { id, status }  = req.body;

  try {
    const pool = await poolPromise;
    const response = await pool.request()
    .input('userId', sql.Int, id)
    .input('userStatus', sql.Bit, status)
    .query(`UPDATE [User]
            SET [Is_Active] = @userStatus
            WHERE [ID] = @userId`);
    res.status(200).json('Estatus actualizado con éxito');
  } 
  catch (error) {
    console.error('Error al actualizar el status');
    res.status(500).json({message: 'Error al actualizar el status', error});
  }
});


router.put('/change-role', async (req, res) => {
  const { id, role }  = req.body;

  try {
    const pool = await poolPromise;
    const response = await pool.request()
    .input('userId', sql.Int, id)
    .input('userRole', sql.Int, role)
    .query(`UPDATE [User_Role]
            SET [Role] = @userRole
            WHERE [User] = @userId`);
    res.status(200).json('Rol actualizado con éxito');
  } 
  catch (error) {
    console.error('Error al actualizar el rol');
    res.status(500).json({message: 'Error al actualizar el rol', error});
  }
});
  /*try {
    const pool = await poolPromise;
    const request = pool.request()
    .input('role', sql.Int, role)
    .input('userId', sql.Int, userId)
    .query(`UPDATE User_Role
            SET [Role] = @role
            WHERE [userID] = @userId`);
    res.status(200).json('Rol actualizado con éxito');
  } 
  catch (error) {
    console.error('Error al actualizar el rol');
    res.status(500).json({message: 'Error al actualizar el Rol', error})
  }
*/

router.put('/update-profile/:userId', upload.single('profilePicture'), async (req, res) => {
  const { userId } = req.params; // Obtener el ID del usuario de la ruta
  const { password, name } = req.body;
  const profilePicture = req.file ? req.file.filename : null;

  try {
    const pool = await poolPromise;
    const requestUser = pool.request();
    
    let queryUser = 'UPDATE [User] SET ';
    let hasUpdate = false;

    // Actualizar el nombre si existe
    if (name) {
      queryUser += '[User_Name] = @name, ';
      requestUser.input('name', sql.NVarChar, name);
      hasUpdate = true;
    }

    // Actualizar la contraseña si existe
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      queryUser += '[Password] = @password, ';
      requestUser.input('password', sql.NVarChar, hashedPassword);
      hasUpdate = true;
    }

    // Verificar si hay campos para actualizar
    if (hasUpdate) {
      queryUser = queryUser.slice(0, -2); // Eliminar la última coma
      queryUser += ' WHERE Id = @userId'; // Usar el ID para filtrar
      requestUser.input('userId', sql.Int, userId); // Asegurarse de que el tipo de dato es correcto
      await requestUser.query(queryUser);
    }

    // Actualizar la imagen de perfil si se ha subido una
    if (profilePicture) {
      const requestPhoto = pool.request();
      await requestPhoto
        .input('userId', sql.Int, userId)
        .query(`UPDATE [User_Image] SET [Is_Active] = 0 WHERE [User] = @userId`);

      await requestPhoto
        .input('profilePicture', sql.NVarChar, profilePicture)
        .query(`INSERT INTO [User_Image]([User], [Path]) VALUES(@userId, @profilePicture)`);
    }

    // Verificar si hubo cambios
    if (hasUpdate || profilePicture) {
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
