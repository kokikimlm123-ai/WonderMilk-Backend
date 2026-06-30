import express from 'express';
import baserow from '../services/baserow.js';

const router = express.Router();

/**
 * Dashboard Metrics
 */
router.get('/metrics', async (req, res, next) => {
  try {

    // Load ALL records
    const data = await baserow.getAllRows();
    const samples = data.results || [];

    console.log("Dashboard Metrics");
    console.log("Total Records:", samples.length);

    // Average helper
    const avg = (field) => {
      const values = samples
        .map(row => Number(row[field]))
        .filter(v => !isNaN(v));

      if (values.length === 0) return "0.00";

      return (
        values.reduce((a, b) => a + b, 0) /
        values.length
      ).toFixed(2);
    };

    // Feed Type Distribution
    const feedTypeCounts = {};

    samples.forEach((row) => {

      const feedType =
        row.field_9063548 ||
        "Unknown";

      feedTypeCounts[feedType] =
        (feedTypeCounts[feedType] || 0) + 1;

    });

    res.json({
      success: true,
      data: {

        totalSamples: samples.length,

        feedTypeCount: Object.keys(feedTypeCounts).length,

        averageCP: avg('field_9063541'),

        averageADF: avg('field_9063526'),

        averageNDF: avg('field_9063630'),

        averageFat: avg('field_9063545'),

        averageAsh: avg('field_9063529'),

        averageStarch: avg('field_9063724'),

        feedTypeDistribution: feedTypeCounts,

        lastUpdated: new Date().toISOString()

      }
    });

  } catch (error) {

    next(error);

  }
});


/**
 * Feed Type Summary
 */
router.get('/feed-types', async (req, res, next) => {

  try {

    const data = await baserow.getAllRows();

    const samples = data.results || [];

    const feedTypes = {};

    samples.forEach((row) => {

      const feedType =
        row.field_9063548 ||
        "Unknown";

      feedTypes[feedType] =
        (feedTypes[feedType] || 0) + 1;

    });

    const distribution = Object.entries(feedTypes).map(
      ([name, count]) => ({

        name,

        count,

        percentage: (
          (count / samples.length) * 100
        ).toFixed(1)

      })
    );

    res.json({

      success: true,

      data: distribution

    });

  } catch (error) {

    next(error);

  }

});

export default router;