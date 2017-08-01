const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 1337;

app.use(express.static(path.join(__dirname, './')));

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, 'localhost', err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`Server up at http://localhost:${port}`);
});
