import express from 'express';
import baserow from '../services/baserow.js';
import { FIELD_MAP } from '../config/fieldMap.js';

const router = express.Router();

const nutrientFields = [
  { key: 'cp', label: 'CP', field: FIELD_MAP.CP, unit: '%' },
  { key: 'ndf', label: 'NDF', field: FIELD_MAP.NDF, unit: '%' },
  { key: 'adf', label: 'ADF', field: FIELD_MAP.ADF, unit: '%' },
  { key: 'fat', label: 'Fat', field: FIELD_MAP.FAT, unit: '%' },
  { key: 'ash', label: 'Ash', field: FIELD_MAP.ASH, unit: '%' },
  { key: 'starch', label: 'Starch', field: FIELD_MAP.STARCH, unit: '%' }
];

const asNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const average = (rows, field) => {
  const values = rows.map((row) => asNumber(row[field])).filter((value) => value !== null);
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const formatAverage = (value) => (value === null ? null : Number(value.toFixed(2)));

const getFeedType = (row) => {
  const value = row[FIELD_MAP.FEED_TYPE] || row.Feed_Type || row['Feed Type'];
  return String(value || 'Unknown').trim() || 'Unknown';
};

const buildFeedAnalysis = (samples) => {
  const groups = new Map();

  samples.forEach((row) => {
    const feedType = getFeedType(row);
    if (!groups.has(feedType)) groups.set(feedType, []);
    groups.get(feedType).push(row);
  });

  return Array.from(groups.entries())
    .map(([feedType, rows]) => {
      const averages = Object.fromEntries(
        nutrientFields.map(({ key, field }) => [key, formatAverage(average(rows, field))])
      );

      return {
        feedType,
        sampleCount: rows.length,
        percentage: samples.length ? Number(((rows.length / samples.length) * 100).toFixed(1)) : 0,
        averages
      };
    })
    .sort((a, b) => b.sampleCount - a.sampleCount || a.feedType.localeCompare(b.feedType));
};

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

    const feedAnalysis = buildFeedAnalysis(samples);
    const feedTypeCounts = Object.fromEntries(
      feedAnalysis.map((item) => [item.feedType, item.sampleCount])
    );

    const avg = (field) => formatAverage(average(samples, field)) ?? 0;

    res.json({
      success: true,
      data: {

        totalSamples: samples.length,

        feedTypeCount: feedAnalysis.length,

        averageCP: avg(FIELD_MAP.CP),

        averageADF: avg(FIELD_MAP.ADF),

        averageNDF: avg(FIELD_MAP.NDF),

        averageFat: avg(FIELD_MAP.FAT),

        averageAsh: avg(FIELD_MAP.ASH),

        averageStarch: avg(FIELD_MAP.STARCH),

        feedTypeDistribution: feedTypeCounts,

        feedAnalysis,

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

    const distribution = buildFeedAnalysis(samples).map(
      ({ feedType, sampleCount, percentage }) => ({

        name: feedType,

        count: sampleCount,

        percentage

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

/**
 * Dynamic feed-type analytics
 */
router.get('/feed-analysis', async (req, res, next) => {
  try {
    const data = await baserow.getAllRows();
    const samples = data.results || [];
    const analysis = buildFeedAnalysis(samples);

    res.json({
      success: true,
      data: {
        totalSamples: samples.length,
        feedTypeCount: analysis.length,
        nutrients: nutrientFields.map(({ key, label, unit }) => ({ key, label, unit })),
        feedTypes: analysis,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
