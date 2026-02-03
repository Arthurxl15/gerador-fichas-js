const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const pdfform = require('pdfform');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Rota para página inicial
app.get('/', (req, res) => {
  res.render('index');
});

// Rota para upload e processamento
app.post('/upload', upload.single('pdf_livro'), async (req, res) => {
  const filePath = req.file.path;
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  const texto = data.text;

  // Extração simples (personalize)
  const dados = {};
  if (texto.includes('Nome:')) {
    const match = texto.match(/Nome:\s*(.+)/);
    dados.Nome = match ? match[1].trim() : '';
  }
  // Adicione mais campos

  // Preencher template (assuma 'template.pdf' na pasta fichas)
  const templatePath = path.join(__dirname, 'fichas', 'template.pdf');
  const outputPath = path.join(__dirname, 'outputs', 'ficha_preenchida.pdf');
  pdfform().fill(templatePath, outputPath, dados, (err) => {
    if (err) return res.send('Erro ao preencher PDF');
    res.download(outputPath);
    fs.unlinkSync(filePath); // Limpar upload
  });
});

app.listen(3000, () => console.log('App rodando em http://localhost:3000'));
