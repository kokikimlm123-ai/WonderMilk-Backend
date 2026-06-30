import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import samplesRouter from './routes/samples.js';
import dashboardRouter from './routes/dashboard.js';

dotenv.config();
console.log('INDEX URL=', process.env.VITE_BASEROW_URL);
console.log('INDEX TOKEN=', process.env.VITE_BASEROW_TOKEN ? 'FOUND' : 'MISSING');
console.log('INDEX TABLE=', process.env.VITE_TABLE_ID);
const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    url: process.env.VITE_BASEROW_URL,
    table: process.env.VITE_TABLE_ID,
    token: process.env.VITE_BASEROW_TOKEN ? 'FOUND' : 'MISSING',
    clientUrl: CLIENT_URL
  });
});

app.use('/api/samples', samplesRouter);
app.use('/api/dashboard', dashboardRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for ${CLIENT_URL}`);
});
