import express from 'express';
import Database from 'better-sqlite3';
import axios from 'axios';
import googleTrends from 'google-trends-api';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../../database.db');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ============================================
// PHASE 2.4: AI PRODUCT DESCRIPTION GENERATOR
// ============================================

// Generate product descriptions with GPT-4
router.post('/product-descriptions/generate', async (req, res) => {
  try {
    const { productName, productType, targetAudience, keywords, tone = 'professional', count = 3 } = req.body;

    if (!productName) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({ success: false, error: 'OpenAI API key not configured' });
    }

    const prompt = `Generate ${count} unique, SEO-optimized product descriptions for a ${productType || 'print-on-demand product'} called "${productName}".

Target audience: ${targetAudience || 'general consumers'}
Keywords to include: ${keywords || 'quality, unique, custom'}
Tone: ${tone}

For each description:
1. Write a compelling 150-200 word description
2. Include emotional appeal and benefits
3. Naturally incorporate the keywords
4. Add a call-to-action
5. Optimize for SEO

Format as JSON array with: title, description, seoTitle, seoDescription, tags`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert copywriter specializing in e-commerce product descriptions and SEO.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let descriptions;
    try {
      descriptions = JSON.parse(response.data.choices[0].message.content);
    } catch (e) {
      // If not JSON, parse as text
      const content = response.data.choices[0].message.content;
      descriptions = [{ title: productName, description: content, seoTitle: productName, seoDescription: content.substring(0, 160), tags: keywords?.split(',') || [] }];
    }

    res.json({
      success: true,
      descriptions: Array.isArray(descriptions) ? descriptions : [descriptions],
      usage: response.data.usage,
    });
  } catch (error) {
    console.error('Error generating descriptions:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bulk generate descriptions
router.post('/product-descriptions/bulk-generate', async (req, res) => {
  try {
    const { products } = req.body; // Array of {productName, productType, targetAudience}

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, error: 'Products array is required' });
    }

    const results = [];

    for (const product of products) {
      try {
        const prompt = `Generate a compelling SEO-optimized product description for: ${product.productName} (${product.productType || 'product'}).
Keep it concise (100-150 words), engaging, and optimized for search engines.`;

        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are an expert e-commerce copywriter.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 300,
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        results.push({
          productName: product.productName,
          description: response.data.choices[0].message.content,
          success: true,
        });
      } catch (error) {
        results.push({
          productName: product.productName,
          error: error.message,
          success: false,
        });
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error in bulk generation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PHASE 2.5: ADVANCED TREND PREDICTOR
// ============================================

// Get advanced trend predictions (30-60 days)
router.get('/trends/predict', async (req, res) => {
  try {
    const { keyword, timeframe = '30d', geo = 'US' } = req.query;

    if (!keyword) {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }

    // Get historical trend data
    const trendData = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      geo,
    });

    const parsed = JSON.parse(trendData);
    const timelineData = parsed.default.timelineData;

    // Simple trend prediction algorithm
    const values = timelineData.map(d => d.value[0]);
    const recentValues = values.slice(-30);
    const average = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const trend = values[values.length - 1] - values[0];
    const volatility = Math.sqrt(recentValues.map(v => Math.pow(v - average, 2)).reduce((a, b) => a + b, 0) / recentValues.length);

    // Predict next 30-60 days
    const predictions = [];
    let lastValue = values[values.length - 1];

    for (let i = 1; i <= 60; i++) {
      const predictedChange = (trend / values.length) * 0.7; // Dampened trend
      const noise = (Math.random() - 0.5) * volatility * 0.3; // Reduced volatility
      lastValue = Math.max(0, Math.min(100, lastValue + predictedChange + noise));
      predictions.push({
        day: i,
        predictedValue: Math.round(lastValue),
        confidence: Math.max(10, 90 - i * 1.2), // Confidence decreases over time
      });
    }

    // Seasonal analysis (mock - would use historical data)
    const month = new Date().getMonth();
    const seasonalFactors = {
      0: 0.9, 1: 0.85, 2: 0.95, 3: 1.0, 4: 1.05, 5: 1.1,
      6: 1.15, 7: 1.15, 8: 1.05, 9: 1.1, 10: 1.2, 11: 1.25, // Holiday season boost
    };

    const investmentScore = Math.round(
      (average / 100) * 40 + // Base interest
      (trend > 0 ? 30 : -10) + // Trend direction
      (volatility < 15 ? 20 : -10) + // Stability bonus
      (seasonalFactors[month] - 1) * 10 // Seasonal factor
    );

    res.json({
      success: true,
      keyword,
      currentTrend: {
        currentValue: values[values.length - 1],
        averageValue: Math.round(average),
        trendDirection: trend > 0 ? 'rising' : 'falling',
        volatility: Math.round(volatility),
      },
      predictions: {
        next30Days: predictions.slice(0, 30),
        next60Days: predictions.slice(30, 60),
      },
      analysis: {
        investmentScore: Math.max(0, Math.min(100, investmentScore)),
        seasonalFactor: seasonalFactors[month],
        recommendation: investmentScore > 70 ? 'Strong Buy' : investmentScore > 50 ? 'Buy' : investmentScore > 30 ? 'Hold' : 'Avoid',
      },
      historicalData: timelineData.slice(-30).map(d => ({ date: d.formattedTime, value: d.value[0] })),
    });
  } catch (error) {
    console.error('Error predicting trends:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Market cycle detection
router.get('/trends/market-cycle', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }

    const trendData = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
    });

    const parsed = JSON.parse(trendData);
    const values = parsed.default.timelineData.map(d => d.value[0]);

    // Detect peaks and troughs
    const peaks = [];
    const troughs = [];

    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peaks.push({ index: i, value: values[i] });
      } else if (values[i] < values[i - 1] && values[i] < values[i + 1]) {
        troughs.push({ index: i, value: values[i] });
      }
    }

    // Determine cycle phase
    const lastValue = values[values.length - 1];
    const recentPeaks = peaks.filter(p => p.index > values.length - 30);
    const recentTroughs = troughs.filter(t => t.index > values.length - 30);

    let phase = 'unknown';
    if (recentPeaks.length > 0 && lastValue < recentPeaks[recentPeaks.length - 1].value * 0.9) {
      phase = 'decline';
    } else if (recentTroughs.length > 0 && lastValue > recentTroughs[recentTroughs.length - 1].value * 1.1) {
      phase = 'growth';
    } else if (recentPeaks.length > 0) {
      phase = 'peak';
    } else if (recentTroughs.length > 0) {
      phase = 'trough';
    }

    res.json({
      success: true,
      keyword,
      marketCycle: {
        currentPhase: phase,
        peaksDetected: peaks.length,
        troughsDetected: troughs.length,
        recentPeaks: recentPeaks.map(p => p.value),
        recentTroughs: recentTroughs.map(t => t.value),
        cyclePeriod: peaks.length > 1 ? Math.round((peaks[peaks.length - 1].index - peaks[0].index) / (peaks.length - 1)) : null,
      },
    });
  } catch (error) {
    console.error('Error detecting market cycle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PHASE 2.6: AI KEYWORD OPTIMIZER
// ============================================

// Generate SEO keywords
router.post('/keywords/optimize', async (req, res) => {
  try {
    const { productName, niche, targetAudience } = req.body;

    if (!productName) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    if (!OPENAI_API_KEY) {
      return res.status(503).json({ success: false, error: 'OpenAI API key not configured' });
    }

    const prompt = `As an SEO expert, generate a comprehensive keyword strategy for a print-on-demand product:

Product: ${productName}
Niche: ${niche || 'general'}
Target Audience: ${targetAudience || 'general consumers'}

Provide:
1. 10 primary keywords (high search volume, medium competition)
2. 15 long-tail keywords (specific, lower competition)
3. 10 related keywords (semantic variations)
4. Keyword difficulty scores (1-100 for each)
5. Estimated monthly search volume
6. 10 trending hashtags for social media

Format as JSON with arrays: primaryKeywords, longTailKeywords, relatedKeywords, hashtags
Each keyword should have: keyword, difficulty, searchVolume, competitionLevel (low/medium/high)`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an SEO and keyword research expert.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let keywords;
    try {
      keywords = JSON.parse(response.data.choices[0].message.content);
    } catch (e) {
      // Fallback parsing
      const content = response.data.choices[0].message.content;
      keywords = {
        primaryKeywords: [{ keyword: productName, difficulty: 50, searchVolume: 1000, competitionLevel: 'medium' }],
        longTailKeywords: [],
        relatedKeywords: [],
        hashtags: [],
        rawContent: content,
      };
    }

    res.json({
      success: true,
      keywords,
      usage: response.data.usage,
    });
  } catch (error) {
    console.error('Error optimizing keywords:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Competition analysis
router.post('/keywords/competition', async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }

    // Get trend data as proxy for competition
    const trendData = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });

    const parsed = JSON.parse(trendData);
    const avgInterest = parsed.default.timelineData.reduce((sum, d) => sum + d.value[0], 0) / parsed.default.timelineData.length;

    // Get related queries
    const relatedQueries = await googleTrends.relatedQueries({ keyword });
    const relatedParsed = JSON.parse(relatedQueries);

    const topQueries = relatedParsed.default.rankedList[0]?.rankedKeyword || [];

    res.json({
      success: true,
      keyword,
      competition: {
        level: avgInterest > 70 ? 'high' : avgInterest > 40 ? 'medium' : 'low',
        interestScore: Math.round(avgInterest),
        difficulty: Math.round(avgInterest * 1.2), // Rough approximation
        recommendation: avgInterest < 50 ? 'Good opportunity - lower competition' : 'Highly competitive - consider long-tail variations',
      },
      relatedKeywords: topQueries.slice(0, 10).map(q => ({
        keyword: q.query,
        value: q.value,
      })),
    });
  } catch (error) {
    console.error('Error analyzing competition:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trending hashtags generator
router.get('/keywords/hashtags', async (req, res) => {
  try {
    const { niche, platform = 'general' } = req.query;

    if (!niche) {
      return res.status(400).json({ success: false, error: 'Niche is required' });
    }

    if (!OPENAI_API_KEY) {
      // Fallback generic hashtags
      return res.json({
        success: true,
        hashtags: [
          '#' + niche.replace(/\s+/g, ''),
          '#POD',
          '#PrintOnDemand',
          '#CustomDesign',
          '#UniqueGifts',
          '#Trending',
          '#ShopSmall',
          '#Handmade',
          '#CustomMade',
          '#GiftIdeas',
        ],
      });
    }

    const prompt = `Generate 20 trending, relevant hashtags for ${platform} for a ${niche} print-on-demand product.

Include:
- 5 broad reach hashtags (100K+ posts)
- 10 medium reach hashtags (10K-100K posts)
- 5 niche-specific hashtags (1K-10K posts)

Format as simple JSON array of hashtags with # prefix.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let hashtags;
    try {
      hashtags = JSON.parse(response.data.choices[0].message.content);
    } catch (e) {
      const content = response.data.choices[0].message.content;
      hashtags = content.match(/#\w+/g) || [];
    }

    res.json({
      success: true,
      hashtags: Array.isArray(hashtags) ? hashtags : [hashtags],
      platform,
      niche,
    });
  } catch (error) {
    console.error('Error generating hashtags:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
