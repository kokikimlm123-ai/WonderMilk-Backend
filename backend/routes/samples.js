import express from 'express';
import baserow from '../services/baserow.js';

const router = express.Router();

// ⚠️ CRITICAL: /search/query MUST come before /:id
// Otherwise Express matches /search/query as id='search' and never reaches search handler

// GET all samples with pagination and filtering
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
        // Use correct field ID for Feed Type
        const ft = row['field_9063548'] || row['Feed_Type'] || row['Feed Type'] || '';
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

// ✅ SEARCH ROUTE - MUST BE BEFORE /:id
// GET search results by query
router.get('/search/query', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    
    console.log(`🔍 Searching for: "${q}"`);
    const data = await baserow.searchRows(q);
    
    console.log(`✅ Found ${data.results?.length || 0} results`);
    
    res.json({ 
      success: true, 
      count: data.results?.length || 0, 
      results: data.results || [] 
    });
  } catch (error) {
    console.error('❌ Search error:', error.message);
    next(error);
  }
});

// GET single sample by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID is numeric
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Invalid sample ID', 
        received: id 
      });
    }

    console.log(`📋 Fetching sample ID: ${id}`);
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
    console.log('📝 Creating new sample:', Object.keys(req.body));
    const data = await baserow.createRow(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('❌ Create error:', error.message);
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

    console.log(`✏️ Updating sample ID: ${id}`);
    const data = await baserow.updateRow(id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Update error:', error.message);
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

    console.log(`🗑️ Deleting sample ID: ${id}`);
    await baserow.deleteRow(id);
    res.json({ success: true, message: 'Sample deleted' });
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    next(error);
  }
});

export default router;