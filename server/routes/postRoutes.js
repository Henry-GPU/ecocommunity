const express = require('express');
const poolPromise = require('../config/database');
const { upload } = require('../middlewares/upload');
const sql = require('mssql'); // Asegúrate de tener esto al principio del archivo


const router = express.Router();

// Crear post
router.post('/posts', upload.single('postImage'), async (req, res) => {
  const userEmail = req.body.email;
  const userName = req.body.name;
  const comment = req.body.comment;
  const location = req.body.location;
  const postImage = req.file ? req.file.filename : '';

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('UserEmail', sql.NVarChar, userEmail)
      .input('UserName', sql.NVarChar, userName)
      .input('PostImage', sql.NVarChar, postImage)
      .input('Comment', sql.Text, comment)
      .input('Location', sql.NVarChar, location)
      .query(`
        INSERT INTO Posts (UserEmail, UserName, PostImage, Comment, Location)
        VALUES (@UserEmail, @UserName, @PostImage, @Comment, @Location)
      `);
    
    res.status(201).json({ message: 'Post creado con éxito' });
  } catch (error) {
    console.error('Error al crear el post:', error);
    res.status(500).json({ message: 'Error al crear el post', error });
  }
});

// Obtener posts
router.get('/posts', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Posts ORDER BY CreatedAt DESC');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    res.status(500).json({ message: 'Error al obtener los posts', error });
  }
});

// Likes
router.post('/posts/:id/like', async (req, res) => {
  const postId = req.params.id;
  const userEmail = req.body.email;

  try {
    const pool = await poolPromise;
    const postResult = await pool.request()
      .input('PostId', sql.Int, postId)
      .query('SELECT Likes FROM Posts WHERE Id = @PostId');
    
    const post = postResult.recordset[0];
    let likesArray = post.Likes ? JSON.parse(post.Likes) : [];

    if (likesArray.includes(userEmail)) {
      return res.status(400).json({ message: 'Ya diste like a esta publicación' });
    }
    likesArray.push(userEmail);

    await pool.request()
      .input('PostId', sql.Int, postId)
      .input('Likes', sql.NVarChar, JSON.stringify(likesArray))
      .query('UPDATE Posts SET Likes = @Likes WHERE Id = @PostId');

    res.status(200).json({ message: 'Like agregado', likesCount: likesArray.length });
  } catch (error) {
    console.error('Error al dar like:', error);
    res.status(500).json({ message: 'Error al dar like', error });
  }
});

router.post('/posts/:id/unlike', async (req, res)=>{
    const userEmail = req.body.email;
  const postId = req.params.id;

  try {
    const pool = await poolPromise;
    const postResult = await pool.request()
      .input('PostId', sql.Int, postId)
      .query('SELECT Likes FROM Posts WHERE Id = @PostId');
    
    const post = postResult.recordset[0];

    if (!post || !post.Likes) {
      return res.status(404).json({ message: 'Publicación no encontrada o no tiene likes.' });
    }
    let likesArray = JSON.parse(post.Likes);
    if (!likesArray.includes(userEmail)) {
      return res.status(400).json({ message: 'No has dado like a esta publicación' });
    }
    likesArray = likesArray.filter(email => email !== userEmail);
    await pool.request()
      .input('PostId', sql.Int, postId)
      .input('Likes', sql.NVarChar, JSON.stringify(likesArray)) 
      .query('UPDATE Posts SET Likes = @Likes WHERE Id = @PostId');
    res.status(200).json({ message: 'Like eliminado correctamente', likesCount: likesArray.length });
  } catch (error) {
    console.error('Error al eliminar el like:', error);
    res.status(500).json({ message: 'Error al eliminar el like', error });
  }
});

router.post('/posts/:id/verify', async (req, res) => {
    const postId = req.params.id;
    const userEmail = req.body.email;
  
    try {
      const pool = await poolPromise;
      const postResult = await pool.request()
        .input('PostId', sql.Int, postId)
        .query('SELECT Verifications FROM Posts WHERE Id = @PostId');
      
      const post = postResult.recordset[0];
      let verificationsArray = JSON.parse(post.Verifications);
      if (verificationsArray.includes(userEmail)) {
        return res.status(400).json({ message: 'Ya verificaste esta publicación' });
      }
      verificationsArray.push(userEmail);
      await pool.request()
        .input('PostId', sql.Int, postId)
        .input('Verifications', sql.NVarChar, JSON.stringify(verificationsArray)) 
        .query('UPDATE Posts SET Verifications = @Verifications WHERE Id = @PostId');
  
      res.status(200).json({ message: 'Verificado registrado exitosamente', verificationsCount: verificationsArray.length });
    } catch (error) {
      console.error('Error al verificar la publicación:', error);
      res.status(500).json({ message: 'Error al verificar la publicación', error });
    }
  });


  
  
  
module.exports = router;
