import express from 'express';

const router = express.Router();

// Christmas design templates with festive themes
const christmasDesigns = [
  {
    id: 0,
    name: "Classic Santa Workshop",
    theme: "Traditional Christmas",
    description: "Vintage Santa's workshop with elves and toys",
    colors: ["#C41E3A", "#165B33", "#F4E6D7", "#FFD700"],
    elements: ["Santa Claus", "Elves", "Toys", "Workshop", "Snow"],
    targetAudience: "Families, Traditional Christmas lovers",
    profitPotential: "High",
    trendScore: 92,
    suggestedProducts: ["T-Shirt", "Mug", "Tote Bag", "Sweatshirt"],
    canvaKeywords: "santa workshop vintage christmas elves toys",
    designTips: [
      "Use warm, nostalgic colors",
      "Include traditional Christmas elements",
      "Add subtle snowflakes in background",
      "Consider adding personalization options"
    ],
    pricing: {
      tshirt: { retail: 24.99, cost: 15.44, profit: 9.55 },
      mug: { retail: 16.99, cost: 9.25, profit: 7.74 },
      sweatshirt: { retail: 34.99, cost: 22.47, profit: 12.52 }
    }
  },
  {
    id: 1,
    name: "Minimalist Nordic Christmas",
    theme: "Modern Scandinavian",
    description: "Simple, elegant Nordic-inspired Christmas design",
    colors: ["#2C3E50", "#ECF0F1", "#C0392B", "#95A5A6"],
    elements: ["Geometric Trees", "Stars", "Minimalist Ornaments", "Simple Lines"],
    targetAudience: "Modern design lovers, Millennials",
    profitPotential: "Very High",
    trendScore: 88,
    suggestedProducts: ["T-Shirt", "Pillow", "Wall Art", "Tote Bag"],
    canvaKeywords: "minimalist nordic christmas scandinavian geometric",
    designTips: [
      "Keep it simple and clean",
      "Use negative space effectively",
      "Stick to 2-3 colors max",
      "Focus on geometric shapes"
    ],
    pricing: {
      tshirt: { retail: 26.99, cost: 15.44, profit: 11.55 },
      pillow: { retail: 22.99, cost: 12.50, profit: 10.49 },
      poster: { retail: 19.99, cost: 8.75, profit: 11.24 }
    }
  },
  {
    id: 2,
    name: "Funny Christmas Puns",
    theme: "Humor & Wordplay",
    description: "Witty Christmas puns and funny holiday phrases",
    colors: ["#0F4C3A", "#FFFFFF", "#D4AF37", "#8B0000"],
    elements: ["Text-based", "Puns", "Icons", "Holiday Humor"],
    targetAudience: "Millennials, Gen Z, Humor lovers",
    profitPotential: "Very High",
    trendScore: 95,
    suggestedProducts: ["T-Shirt", "Mug", "Sweatshirt", "Sticker"],
    canvaKeywords: "funny christmas puns humor holiday jokes",
    designTips: [
      "Use bold, readable fonts",
      "Keep puns relatable and trending",
      "Add small festive icons",
      "Test readability on dark/light backgrounds"
    ],
    samplePuns: [
      "Sleigh All Day",
      "Resting Grinch Face",
      "All I Want for Christmas is Naps",
      "Jingle All the Way (to the Buffet)",
      "Fleece Navidad"
    ],
    pricing: {
      tshirt: { retail: 24.99, cost: 15.44, profit: 9.55 },
      mug: { retail: 16.99, cost: 9.25, profit: 7.74 },
      sweatshirt: { retail: 32.99, cost: 22.47, profit: 10.52 }
    }
  },
  {
    id: 3,
    name: "Pet Christmas Collection",
    theme: "Pet Lovers",
    description: "Cute Christmas designs featuring dogs, cats, and other pets",
    colors: ["#8B4513", "#FFFFFF", "#228B22", "#FFD700"],
    elements: ["Pets in Santa Hats", "Paw Prints", "Pet Ornaments", "Holiday Treats"],
    targetAudience: "Pet owners, Dog moms, Cat dads",
    profitPotential: "Very High",
    trendScore: 91,
    suggestedProducts: ["T-Shirt", "Mug", "Sweatshirt", "Pet Bandana"],
    canvaKeywords: "christmas dog cat pet santa cute holiday",
    designTips: [
      "Focus on popular breeds (Golden Retriever, French Bulldog, etc.)",
      "Add personalization options",
      "Use cute, cartoonish style",
      "Include breed-specific details"
    ],
    variations: [
      "Dog Mom Christmas",
      "Meowy Christmas (Cat)",
      "Santa Paws",
      "Furry Christmas"
    ],
    pricing: {
      tshirt: { retail: 25.99, cost: 15.44, profit: 10.55 },
      mug: { retail: 17.99, cost: 9.25, profit: 8.74 },
      sweatshirt: { retail: 34.99, cost: 22.47, profit: 12.52 }
    }
  },
  {
    id: 4,
    name: "Vintage Christmas Truck",
    theme: "Rustic Farmhouse",
    description: "Red vintage truck carrying Christmas tree and gifts",
    colors: ["#8B0000", "#0F4C3A", "#D4A373", "#F5F5DC"],
    elements: ["Red Truck", "Christmas Tree", "Plaid Pattern", "Rustic Background"],
    targetAudience: "Farmhouse decor lovers, Country style fans",
    profitPotential: "High",
    trendScore: 87,
    suggestedProducts: ["Pillow", "Wall Art", "T-Shirt", "Kitchen Towel"],
    canvaKeywords: "vintage truck christmas tree farmhouse rustic red",
    designTips: [
      "Use watercolor or distressed textures",
      "Add buffalo plaid patterns",
      "Include snow or winter elements",
      "Keep the vintage aesthetic consistent"
    ],
    pricing: {
      pillow: { retail: 24.99, cost: 12.50, profit: 12.49 },
      poster: { retail: 21.99, cost: 8.75, profit: 13.24 },
      tshirt: { retail: 25.99, cost: 15.44, profit: 10.55 }
    }
  }
];

// GET /api/christmas/design/:id
// Get a specific Christmas design template
router.get('/design/:id', (req, res) => {
  try {
    const designId = parseInt(req.params.id);

    if (isNaN(designId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid design ID. Must be a number.',
        available_ids: christmasDesigns.map(d => d.id)
      });
    }

    const design = christmasDesigns.find(d => d.id === designId);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: `Design with ID ${designId} not found`,
        available_designs: christmasDesigns.length,
        hint: `Try IDs from 0 to ${christmasDesigns.length - 1}`
      });
    }

    res.json({
      success: true,
      design,
      nextSteps: [
        `1. Go to Canva.com and create a new design`,
        `2. Search for: "${design.canvaKeywords}"`,
        `3. Use colors: ${design.colors.join(', ')}`,
        `4. Apply design tips provided`,
        `5. Download as PNG (transparent background recommended)`,
        `6. Upload to Printful using /api/automation/printful/create-product`
      ],
      quickStart: {
        canvaLink: `https://www.canva.com/search?q=${encodeURIComponent(design.canvaKeywords)}`,
        suggestedPrice: design.pricing.tshirt.retail,
        estimatedProfit: design.pricing.tshirt.profit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching design',
      error: error.message
    });
  }
});

// GET /api/christmas/designs
// Get all Christmas design templates
router.get('/designs', (req, res) => {
  try {
    const { sort = 'trend' } = req.query;

    let sortedDesigns = [...christmasDesigns];

    if (sort === 'trend') {
      sortedDesigns.sort((a, b) => b.trendScore - a.trendScore);
    } else if (sort === 'profit') {
      sortedDesigns.sort((a, b) => b.pricing.tshirt.profit - a.pricing.tshirt.profit);
    }

    res.json({
      success: true,
      total: sortedDesigns.length,
      designs: sortedDesigns,
      summary: {
        topTrending: sortedDesigns[0].name,
        mostProfitable: sortedDesigns.reduce((max, d) =>
          d.pricing.tshirt.profit > max.pricing.tshirt.profit ? d : max
        ).name,
        averageTrendScore: Math.round(
          sortedDesigns.reduce((sum, d) => sum + d.trendScore, 0) / sortedDesigns.length
        )
      },
      quickStartGuide: [
        '1. Pick a design from the list',
        '2. Use GET /api/christmas/design/:id for detailed instructions',
        '3. Create design on Canva.com',
        '4. Upload to Printful',
        '5. Start selling!'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching designs',
      error: error.message
    });
  }
});

// GET /api/christmas/trending
// Get top trending Christmas designs
router.get('/trending', (req, res) => {
  try {
    const topDesigns = [...christmasDesigns]
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 3);

    res.json({
      success: true,
      message: '🎄 Top trending Christmas designs right now!',
      trending: topDesigns.map(d => ({
        id: d.id,
        name: d.name,
        theme: d.theme,
        trendScore: d.trendScore,
        profitPotential: d.profitPotential,
        estimatedProfit: d.pricing.tshirt.profit,
        quickLink: `GET /api/christmas/design/${d.id}`
      })),
      seasonalTip: 'Start creating NOW - Christmas products sell best 2-3 months before the holiday!',
      urgency: {
        daysUntilChristmas: Math.ceil((new Date('2025-12-25') - new Date()) / (1000 * 60 * 60 * 24)),
        optimalLaunchWindow: 'October - Early November',
        currentStatus: new Date().getMonth() >= 9 && new Date().getMonth() <= 10
          ? '✅ PERFECT TIMING!'
          : new Date().getMonth() >= 8
            ? '⚠️ Start soon!'
            : '📅 Plan ahead for next season'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trending designs',
      error: error.message
    });
  }
});

// GET /api/christmas/random
// Get a random Christmas design for inspiration
router.get('/random', (req, res) => {
  try {
    const randomDesign = christmasDesigns[Math.floor(Math.random() * christmasDesigns.length)];

    res.json({
      success: true,
      message: '🎲 Here\'s a random Christmas design idea!',
      design: randomDesign,
      motivation: [
        'Sometimes the best ideas come from random inspiration!',
        'Start with this design and make it your own',
        'You can customize any element to fit your style',
        'Ready to create? Follow the next steps!'
      ],
      nextSteps: [
        `1. Open Canva: https://www.canva.com/search?q=${encodeURIComponent(randomDesign.canvaKeywords)}`,
        `2. Use the suggested colors and elements`,
        `3. Add your personal touch`,
        `4. Download and upload to Printful`,
        `5. List and start selling!`
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching random design',
      error: error.message
    });
  }
});

export default router;
