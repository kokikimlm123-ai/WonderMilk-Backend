import express from 'express';
import baserow from '../services/baserow.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, size = 50, search = '', feedType = '' } = req.query;
    const params = { page, size: Math.min(parseInt(size), 200) };
    
    if (search) {
      params.search = search;
    }

    const data = await baserow.getRows(params);
    
    let results = data.results || [];
    
    if (feedType) {
      results = results.filter(row => {
        const ft = row['Feed Type'] || row['Feed_Type'] || '';
        return ft.toLowerCase().includes(feedType.toLowerCase());
      });
    }

    res.json({
      success: true,
      count: results.length,
      total: data.count || 0,
      page: parseInt(page),
      size: parseInt(params.size),
      results
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await baserow.getRow(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = await baserow.createRow(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const data = await baserow.updateRow(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await baserow.deleteRow(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get('/search/query', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    
    const data = await baserow.searchRows(q);
    res.json({ success: true, count: data.results?.length || 0, results: data.results || [] });
  } catch (error) {
    next(error);
  }
});

export default router;
