const express = require('express');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' })); 

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','public', 'index.html'))
})

// app.get('/vamotime', (req, res) => {
//     res.download(path.join(__dirname, "..", "p-txts", "vamotime.txt"))
// }) only for tests purposes

app.post('/upload-base64', async (req, res) => {
  let { filename, mimeType, base64 } = req.body;

  if (!filename || !base64 || !mimeType) {
    return res.status(400).json({ error: 'filename, mimeType e base64 são obrigatórios' });
  }

  filename = filename.split(' ').join('_');

  console.log(filename, mimeType)

  const buffer = Buffer.from(base64, 'base64');

  const params = {
    Bucket: BUCKET_NAME,
    Key: `${Date.now()}-${filename}`,
    Body: buffer,
    ContentEncoding: 'base64',
    ContentType: mimeType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    res.status(200).json({ message: 'Upload concluído com sucesso', url: fileUrl });
  } catch (err) {
    console.error('Erro no upload:', err);
    res.status(500).json({ error: 'Erro ao fazer upload no S3' });
  }
});

app.get('/arquivos', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME
    });

    const response = await s3.send(command);

    const arquivos = (response.Contents || []).map(obj => {
      return {
        filename: obj.Key,
        url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`
      };
    });

    res.status(200).json(arquivos);
  } catch (err) {
    console.error('Erro ao listar arquivos:', err);
    res.status(500).json({ error: 'Erro ao listar arquivos no S3' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
