const express = require('express');
const { printOrder } = require('./printer');
const app = express();

app.use(express.json());

app.post('/print', async (req, res) => {
  try {
    await printOrder(req.body);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Print failed' });
  }
});

app.listen(3000, () => {
  console.log('🖨️ POS Printer Server listening on http://localhost:3000');
});
