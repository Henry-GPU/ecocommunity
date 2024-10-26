const express = require('express');
const poolPromise = require('../config/database');
const { upload } = require('../middlewares/upload');
const sql = require('mssql');
const axios = require('axios'); // Asegúrate de tener esto al principio del archivo
const { ReturnValueToken } = require('tedious/lib/token/token');
const { cast } = require('sequelize');

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

const router = express.Router();

// Crear post
async function loadFeed(userEmail) {
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
      .query(`SELECT [Post].*, [Community].[Name] AS Community
              FROM [Post]
              JOIN [User] ON [User].[Id] = [Post].[User]
              LEFT JOIN [Post_Community] ON [Post_Community].[Post] = [Post].[Id]
              LEFT JOIN [Community] ON [Post_Community].[Community] = [Community].[Id]
              LEFT JOIN [User_Post_Hidden] ON [Post].[Id] = [User_Post_Hidden].[Post]
                AND [User_Post_Hidden].[User]= @userId
              LEFT JOIN [User_Community_Role] ON [Community].[Id] = [User_Community_Role].[Community]
                AND [User_Community_Role].[User] = @userId
              WHERE ([User_Post_Hidden].[Id] IS NULL 
                OR [User_Post_Hidden].[Is_Hidden] = 0)
              AND [Post].[Is_Active] = 1
              AND [User].[Is_Active] = 1
              AND ([Community].[Id] IS NULL OR [User_Community_Role].[Id] IS NOT NULL)
              ORDER BY [Post].[CreatedAt] DESC`);
    const posts = result.recordset;

    const postDetailsPromises = posts.map(async (post) => {
      const postImage = await axiosInstance.get(`/post-image/${post.Id}`);
      const postAuthor = await axiosInstance.get(`/post-author/${post.Id}`);
      const postLikes = await axiosInstance.get(`/post-likes-count/${post.Id}`);
      const postVerifications = await axiosInstance.get(`/post-verifications-count/${post.Id}`);

      return {
        ...post,
        image: postImage.data.imagePath,
        likes: postLikes.data.likesCount,
        author: postAuthor.data.Author,
        verifications: postVerifications.data.verificationsCount
      };
    });

    const detailedPosts = await Promise.all(postDetailsPromises);
    return detailedPosts;

  } catch (error) {
    console.error('Error cargando feed:', error);
    throw error;
  }
}

async function loadCommunityFeed(userEmail) {
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
      .query(`SELECT [Post].*, [Community].[Name] As [Community] 
              FROM [Post]
              LEFT JOIN [User] ON [Post].[User] = [User].[Id]
              LEFT JOIN [Post_Community] ON [Post].[Id] = [Post_Community].[Post]
              LEFT JOIN [Community] ON [Post_Community].[Community] = [Community].[Id]
              LEFT JOIN [User_Post_Hidden] ON [Post].[Id] = [User_Post_Hidden].[Post]
	              AND [User_Post_Hidden].[User]= @userId
              LEFT JOIN [User_Community_Role] ON [Community].[Id] = [User_Community_Role].[Community]
                AND [User_Community_Role].[User] = @userId
              WHERE ([User_Post_Hidden].[Id] IS NULL 
                OR [User_Post_Hidden].[Is_Hidden] = 0)
                AND [Post].[Is_Active] = 1
                AND [User].[Is_Active] = 1
			          AND [User_Community_Role].[Id] IS NOT NULL
              ORDER BY [Post].[CreatedAt] DESC;`);
    const posts = result.recordset;

    const postDetailsPromises = posts.map(async (post) => {
      const postImage = await axiosInstance.get(`/post-image/${post.Id}`);
      const postAuthor = await axiosInstance.get(`/post-author/${post.Id}`);
      const postLikes = await axiosInstance.get(`/post-likes-count/${post.Id}`);
      const postVerifications = await axiosInstance.get(`/post-verifications-count/${post.Id}`);

      return {
        ...post,
        image: postImage.data.imagePath,
        likes: postLikes.data.likesCount,
        author: postAuthor.data.Author,
        verifications: postVerifications.data.verificationsCount
      };
    });

    const detailedPosts = await Promise.all(postDetailsPromises);
    return detailedPosts;

  } catch (error) {
    console.error('Error cargando feed:', error);
    throw error;
  }
}

async function loadAllPosts() {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`SELECT [Post].*, [Community].[Name] AS Community
              FROM [Post]
              JOIN [User] ON [User].[Id] = [Post].[User]
              LEFT JOIN [Post_Community] ON [Post].[Id] = [Post_Community].[Post]
              LEFT JOIN [Community] ON [Post_Community].[Community] = [Community].[Id]
              ORDER BY [Post].[CreatedAt] DESC`);
    const posts = result.recordset;

    const postDetailsPromises = posts.map(async (post) => {
      const postImage = await axiosInstance.get(`/post-image/${post.Id}`);
      const postAuthor = await axiosInstance.get(`/post-author/${post.Id}`);
      const postLikes = await axiosInstance.get(`/post-likes-count/${post.Id}`);
      const postVerifications = await axiosInstance.get(`/post-verifications-count/${post.Id}`);

      return {
        ...post,
        image: postImage.data.imagePath,
        likes: postLikes.data.likesCount,
        author: postAuthor.data.Author,
        verifications: postVerifications.data.verificationsCount
      };
    });

    const detailedPosts = await Promise.all(postDetailsPromises);
    return detailedPosts;

  } catch (error) {
    console.error('Error cargando feed:', error);
    throw error;
  }
}

router.get('/all-posts', async (req, res) =>{
  try {
    const posts = await loadAllPosts();
    res.status(200).json(posts);
  } 
  catch(error){
    console.error('Error al obtener los posts', error);
    res.status(500).json({message: 'Error al obtener los posts', error});
  }
});

router.get('/community-posts', async(req, res) => {
  const { userEmail } = req.query;
  try {
    const posts = await loadCommunityFeed(userEmail);
    res.status(200).json(posts);
  }
  catch(error){
    console.error('Error al obtener los posts', error);
    res.status(500).json({message: 'Error al obtener los posts', error});
  }
});

router.get('/posts', async (req, res) =>{
  const { userEmail } = req.query;
  try {
    const feed = await loadFeed(userEmail);
    res.status(200).json(feed);
  } 
  catch(error){
    console.error('Error al obtener los posts', error);
    res.status(500).json({message: 'Error al obtener los posts', error});
  }
});

router.put('/post-change-status', async (req, res) => {
  const { id, status }  = req.body;

  try {
    const pool = await poolPromise;
    const response = await pool.request()
    .input('postId', sql.Int, id)
    .input('postStatus', sql.Bit, status)
    .query(`UPDATE [Post]
            SET [Is_Active] = @postStatus
            WHERE [Id] = @postId`);
    res.status(200).json('Estatus actualizado con éxito');
  } 
  catch (error) {
    console.error('Error al actualizar el status');
    res.status(500).json({message: 'Error al actualizar el status', error});
  }
});



router.get('/post-likes-count/:Id', async(req, res) => {
  const postId = req.params.Id;
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input('postId', sql.Int, postId)
    .query(`SELECT COUNT(ID) AS LikesCount
	          FROM [Like]
	          WHERE [Post] = @postId
            AND [Is_Active] = 1;`);

    if(result.recordset.length === 0){
      return res.status(404).send({message: 'Likes no esncontrados'})
    }
    const likesCount = result.recordset[0].LikesCount;
    res.status(200).json({likesCount});
  } 
  catch(error){
    console.error('Error al obtener el numero de likes del post', error);
    res.status(500).send({message: 'Error al obtener el numero de likes del post'})
  }
});

router.get('/post-author/:Id', async(req, res) => {
  const postId = req.params.Id;
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input('postId', sql.Int, postId)
    .query(`SELECT [User].[Id],
            [User].[User_Name], 
            [User].[Email],
            [Role].[Name] AS [Role]
	          FROM [User]
	          LEFT JOIN [Post] ON [Post].[User] = [User].[Id]
            LEFT JOIN [User_Role] ON [User_Role].[User] = [User].[Id]
            LEFT JOIN [Role] ON [User_Role].[Role] = [Role].[Id]
	          WHERE [Post].[Id] = @postId`);

    if (result.recordset.length === 0){
      return res.status(404).send({message: 'Autor no encontrado'});
    }
    const Author = result.recordset[0];
    res.status(200).json({Author});
  } 
  catch (error){
    console.error('Error al obtener el autor del post', error);
    res.status(500).send({message: 'Error al obtener el autor del post'})
  }
});


router.get('/post-verifications-count/:Id', async(req, res) => {
  const postId = req.params.Id;
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input('postId', sql.Int, postId)
    .query(`SELECT COUNT(ID) AS VerificationsCount
	          FROM [Verification]
	          WHERE [Post] = @postId;`);

    if(result.recordset.length === 0){
      return res.status(404).send({message: 'Verificaciones no encontradas'})
    }
    const verificationsCount = result.recordset[0].VerificationsCount;
    res.status(200).json({verificationsCount});
  } 
  catch(error){
    console.error('Error al obtener el numero de verificaciones del post', error);
    res.status(500).send({message: 'Error al obtener el numero de verificaciones del post'})
  }
});

router.get('/post-image/:Id', async(req, res) => {
  const postId = req.params.Id;
  try{
    const pool = await poolPromise;
    const result = await pool.request()
    .input('postId', sql.Int, postId)
    .query(` SELECT [Path] FROM [Post_Image]
             WHERE [Post] = @postId`);

    if (result.recordset.length === 0){
      return res.status(404).send({message: 'Imagen no encontrada'});
    }
    const imagePath = result.recordset[0].Path;
    res.status(200).json({imagePath});
  } 
  catch (error){
    console.error('Error al obtener la imagen del post', error);
    res.status(500).send({message: 'Error al obtener la imagen del post'})
  }
});


router.post('/posts', upload.single('postImage'), async (req, res) => {
  const { comment, email, location, community} = req.body;
  const postImage = req.file ? req.file.filename : null;

  console.log(comment, email, location, community);

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      const queryUserId = `
        SELECT [Id] FROM [User]
        WHERE [Email] = @Email;
      `;
      const idResult = await transaction.request()
        .input('Email', sql.NVarChar, email)
        .query(queryUserId);

      if (!idResult.recordset || idResult.recordset.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const userId = idResult.recordset[0].Id;
      console.log('UserId:', userId);

      const queryPost = `
        INSERT INTO [Post] ([Comment], [User], [Location])
        OUTPUT INSERTED.[Id]
        VALUES (@comment, @userId, @location);
      `;

      const postResult = await transaction.request()
        .input('comment', sql.NVarChar, comment)
        .input('userId', sql.Int, userId)
        .input('location', sql.NVarChar, location)
        .input('community', sql.Int, community)
        .query(queryPost);

      const postId = postResult.recordset[0].Id;
      console.log('PostId después de la inserción:', postId);

      if (postImage) {
        const queryImage = `
          INSERT INTO [Post_Image] ([Path], [Post])
          VALUES (@postImage, @postId);
        `;

        await transaction.request()
          .input('postImage', sql.NVarChar, postImage)
          .input('postId', sql.Int, postId)
          .query(queryImage);
      }
      if(community && community !== 0){
        const queryCommunity = `
          INSERT INTO [Post_Community] ([Post], [Community])
          VALUES (@postId, @postCommunity);
        `;

        await transaction.request()
          .input('postCommunity', sql.NVarChar, community)
          .input('postId', sql.Int, postId)
          .query(queryCommunity);
      }
      await transaction.commit();
      res.status(201).send({ message: 'Post creado con éxito' });
    } catch (err) {
      await transaction.rollback();
      console.error('Error en la transacción:', err);
      res.status(500).send({ message: 'Error al crear el post' });
    }
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    res.status(500).send({ message: 'Error al conectar a la base de datos' });
  }
});


router.get('/check-like/:postId', async(req, res) => {
  const postId = req.params.postId;
  const userEmail = req.query.email;
  console.log(userEmail);
  try {
    const pool = await poolPromise;
    const userResult = await pool.request()
    .input('userEmail', sql.NVarChar, userEmail)
    .query(`SELECT [Id]
            FROM [User]
            WHERE [Email] = @userEmail;
          `);
    if(userResult.recordset.length === 0){
      return res.status(404).json({message: 'Usuario no encontrado'});
    }
    const userId = userResult.recordset[0].Id;
    
    const postResult = await pool.request()
    .input('postId', sql.Int, postId)
    .input('userId', sql.Int, userId)
    .query(`SELECT [Is_Active] AS IsActive
              FROM [Like]
              WHERE [Post] = @postId
              AND [User] = @userId
            `)
    if (postResult.recordset.length > 0) {
      const isActive = postResult.recordset[0].IsActive;
      return res.status(200).json({ hasLiked: isActive });
    } 
    else {
      return res.status(200).json({ hasLiked: false });
    }
  } 
  catch (error) {
    console.error('Error al verificar el like:', error);
    res.status(500).json({ message: 'Error al verificar el like', error });
  }
});

router.post('/like/:postId', async (req, res) => {
  const postId = req.params.postId;
  const userEmail = req.body.email;

  try {
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input('userEmail', sql.NVarChar, userEmail)
      .query(`SELECT [Id] FROM [User] WHERE [Email] = @userEmail`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userId = userResult.recordset[0].Id;


    const postResult = await pool.request()
      .input('postId', sql.Int, postId)
      .input('userId', sql.Int, userId)
      .query(`SELECT [Is_Active] AS IsActive
              FROM [Like] 
              WHERE [Like].[Post] = @postId 
              AND [Like].[User] = @userId`);

    if (postResult.recordset.length > 0) {
      const isActive = postResult.recordset[0].IsActive;
      console.log(isActive);
      if (isActive === true) {
        return res.status(400).json({ message: 'Ya diste like a esta publicación' });
      }else{
        await pool.request()
      .input('postId', sql.Int, postId)
      .input('userId', sql.Int, userId)
      .query(`UPDATE [Like] 
              SET [Is_Active] = 1
              WHERE [Post] = @postId
              AND [User] = @userId;
            `);
      return res.status(200).json({ message: 'Like actualizado' });
      }
    }

    await pool.request()
      .input('postId', sql.Int, postId)
      .input('userId', sql.Int, userId)
      .query(`INSERT INTO [Like] ([User], [Post]) VALUES (@userId, @postId);`);

    res.status(200).json({ message: 'Like agregado' });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({ message: 'Error al dar like', error });
  }
});


router.post('/unlike/:postId', async (req, res) => {
  const postId = req.params.postId;
  const userEmail = req.body.email;

  try {
    const pool = await poolPromise;

    const userResult = await pool.request()
      .input('userEmail', sql.NVarChar, userEmail)
      .query(`SELECT [Id] FROM [User] WHERE [Email] = @userEmail`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const userId = userResult.recordset[0].Id;

    const postResult = await pool.request()
      .input('postId', sql.Int, postId)
      .input('userId', sql.Int, userId)
      .query(`SELECT [Is_Active] AS IsActive
              FROM [Like] 
              WHERE [Like].[Post] = @postId 
              AND [Like].[User] = @userId`);

    if (postResult.recordset.length > 0) {
      const isActive = postResult.recordset[0].IsActive;

      if (isActive === false) {
        return res.status(200).json({ message: 'No hay un like activo para desactivar' });
      }

      await pool.request()
        .input('isActive', sql.Bit, false)
        .input('postId', sql.Int, postId)
        .input('userId', sql.Int, userId)
        .query(`UPDATE [Like] 
                SET [Is_Active] = @isActive
                WHERE [Post] = @postId
                AND [User] = @userId`);

      return res.status(200).json({ message: 'Like desactivado exitosamente' });
    } else {
      return res.status(404).json({ message: 'No has dado like a esta publicación' });
    }
    
  } catch (error) {
    console.error('Error al desactivar el like:', error);
    res.status(500).json({ message: 'Error al desactivar el like', error });
  }
});

router.get('/check-verification/:postId', async(req, res) => {
  const postId = req.params.postId;
  const userEmail = req.query.email;
  console.log(userEmail);
  try {
    const pool = await poolPromise;
    const userResult = await pool.request()
    .input('userEmail', sql.NVarChar, userEmail)
    .query(`SELECT [Id]
            FROM [User]
            WHERE [Email] = @userEmail;
          `);
    if(userResult.recordset.length === 0){
      return res.status(404).json({message: 'Usuario no encontrado'});
    }
    const userId = userResult.recordset[0].Id;
    
    const postResult = await pool.request()
    .input('postId', sql.Int, postId)
    .input('userId', sql.Int, userId)
    .query(`SELECT [Is_Active] AS IsActive
              FROM [Verification]
              WHERE [Post] = @postId
              AND [User] = @userId
            `)
    if (postResult.recordset.length > 0) {
      const isActive = postResult.recordset[0].IsActive;
      return res.status(200).json({ hasVerified: isActive });
    } 
    else {
      return res.status(200).json({ hasVerified: false });
    }
  } 
  catch (error) {
    console.error('Error al checar el verificado:', error);
    res.status(500).json({ message: 'Error al checar el verificado', error });
  }
});

router.post('/verification/:postId', async (req, res) => {
  const postId = req.params.postId;
  const userEmail = req.body.email;

  try {
    const pool = await poolPromise;

    // Buscar el ID del usuario basado en el correo
    const userResult = await pool.request()
      .input('userEmail', sql.NVarChar, userEmail)
      .query(`SELECT [Id] FROM [User] WHERE [Email] = @userEmail`);

    // Validar si el usuario existe
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userId = userResult.recordset[0].Id;

    // Verificar si el usuario ya ha dado "like" a esta publicación
    const postResult = await pool.request()
      .input('postId', sql.Int, postId)
      .input('userId', sql.Int, userId)
      .query(`SELECT [Is_Active] AS IsActive
              FROM [Verification] 
              WHERE [Verification].[Post] = @postId 
              AND [Verification].[User] = @userId`);

    if (postResult.recordset.length > 0) {
      const isActive = postResult.recordset[0].IsActive;
      console.log(isActive);
      if (isActive === true) {
        return res.status(400).json({ message: 'Ya verificaste esta publicación' });
      }
    }

    await pool.request()
      .input('postId', sql.Int, postId)
      .input('userId', sql.Int, userId)
      .query(`INSERT INTO [Verification] ([User], [Post]) VALUES (@userId, @postId);`);

    res.status(200).json({ message: 'Verificación agregada' });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({ message: 'Error al verificar', error });
  }
});

router.post('/hide-post', async(req, res) =>{
  const {email , postId, hide} = req.body;
  const responseUserId = await axiosInstance.get('/get-user-id', {
    params: {
      email: email
    }
  })
  const userId = responseUserId.data.userId;

    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();
    
    try {
      const result = await transaction.request()
      .input('userId', sql.Int, userId)
      .input('postId', sql.Int, postId)
      .query(`SELECT 1 
              FROM [User_Post_Hidden] 
              WHERE [User] = @userId
              And [Post] = @postId`);

      if(result.recordset.length > 0){
        await transaction.request()
        .input('userId', sql.Int, userId)
        .input('postId', sql.Int, postId)
        .input('hide', sql.Bit, hide)
        .query(`UPDATE [User_Post_Hidden]
                SET [Is_Hidden] = @hide
                WHERE [User] = @userId
                AND [Post] = @postId`);
      }else{
        await transaction.request()
        .input('userId', sql.Int, userId)
        .input('postId', sql.Int, postId)
        .input('hide', sql.Bit, hide)
        .query(`INSERT INTO [User_Post_Hidden]
                ([User], [Post], [Is_Hidden])
                VALUES (@userId, @postId, @hide)`)
      }
      await transaction.commit();
      return res.status(200).json({ message: hide ? 'Post ocultado' : 'Post visible' });
    } 
    catch (error) {
      await transaction.rollback(); // Revierte la transacción si hay error
        console.error(error);
        return res.status(500).json({ message: 'Error al ocultar/desocultar el post' });
    }
});
 
module.exports = router;
