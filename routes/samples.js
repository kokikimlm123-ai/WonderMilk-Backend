import express from 'express';
import baserow from '../services/baserow.js';
import { FIELD_MAP } from '../config/fieldMap.js';

const router = express.Router();

const getFeedType = (row) =>
  String(row[FIELD_MAP.FEED_TYPE] || row.Feed_Type || row['Feed Type'] || '').trim();

const matchesFeedType = (row, feedType) =>
  getFeedType(row).toLowerCase() === feedType.trim().toLowerCase();

const matchesSearch = (row, search) => {
  if (!search) return true;
  const query = search.toLowerCase();
  return Object.values(row).some((value) =>
    String(value || '').toLowerCase().includes(query)
  );
};

// GET all samples with pagination and filtering
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, size = 50, search = '', feedType = '' } = req.query;
    const currentPage = Math.max(parseInt(page), 1);
    const pageSize = Math.min(Math.max(parseInt(size), 1), 200);

    if (feedType) {
      const data = await baserow.getAllRows();
      const filteredResults = (data.results || []).filter(
        (row) => matchesFeedType(row, feedType) && matchesSearch(row, search)
      );
      const start = (currentPage - 1) * pageSize;
      const results = filteredResults.slice(start, start + pageSize);

      return res.json({
        success: true,
        count: results.length,
        total: filteredResults.length,
        page: currentPage,
        size: pageSize,
        results
      });
    }

    const params = { page: currentPage, size: pageSize };

    if (search) {
      params.search = search;
    }

    const data = await baserow.getRows(params);
    const results = data.results || [];

    res.json({
      success: true,
      count: results.length,
      total: data.count || 0,
      page: currentPage,
      size: pageSize,
      results
    });
  } catch (error) {
    next(error);
  }
});

// Search route must come before /:id so Express does not match "search" as an ID.
router.get('/search/query', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    console.log(`Searching for: "${q}"`);
    const data = await baserow.searchRows(q);

    console.log(`Found ${data.results?.length || 0} results`);

    res.json({
      success: true,
      count: data.results?.length || 0,
      results: data.results || []
    });
  } catch (error) {
    console.error('Search error:', error.message);
    next(error);
  }
});

// GET single sample by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'Invalid sample ID',
        received: id
      });
    }

    console.log(`Fetching sample ID: ${id}`);
    const data = await baserow.getRow(id);

    if (!data) {
      return res.status(404).json({
        error: 'Sample not found',
        id
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Sample not found',
        details: error.message
      });
    }
    next(error);
  }
});

// POST create new sample
router.post('/', async (req, res, next) => {
  try {
    console.log('Creating new sample:', Object.keys(req.body));
    const data = await baserow.createRow(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Create error:', error.message);
    next(error);
  }
});

// PUT update sample
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid sample ID' });
    }

    console.log(`Updating sample ID: ${id}`);
    const data = await baserow.updateRow(id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Update error:', error.message);
    next(error);
  }
});

// DELETE sample
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid sample ID' });
    }

    console.log(`Deleting sample ID: ${id}`);
    await baserow.deleteRow(id);
    res.json({ success: true, message: 'Sample deleted' });
  } catch (error) {
    console.error('Delete error:', error.message);
    next(error);
  }
});

export default router;
