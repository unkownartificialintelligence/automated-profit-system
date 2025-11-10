import axios from 'axios';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Printful API Integration Module
 * Automatically creates and lists products on Printful
 */

const PRINTFUL_API_BASE = "https://api.printful.com";
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY || "";

// Popular product variants for t-shirts
const PRODUCT_VARIANTS = {
  "bella_canvas_3001": {
    name: "Bella + Canvas 3001 (Unisex)",
    variant_id: 4012, // Black, S
    sizes: {
      S: 4012,
      M: 4013,
      L: 4014,
      XL: 4015,
      "2XL": 4016
    },
    colors: {
      Black: 4012,
      White: 4017,
      Navy: 4018,
      "Heather Gray": 4019
    }
  },
  "gildan_heavy": {
    name: "Gildan 5000 (Heavy Cotton)",
    variant_id: 1,
    sizes: {
      S: 1,
      M: 2,
      L: 3,
      XL: 4,
      "2XL": 5
    },
    colors: {
      Black: 1,
      White: 2,
      Navy: 3
    }
  }
};

/**
 * Create product on Printful with design
 */
export async function createPrintfulProduct(productData, designFile) {
  const { product_name, price, keyword, description } = productData;

  if (!PRINTFUL_API_KEY) {
    console.log("⚠️  Printful API not configured - using mock listing");
    return createMockListing(productData);
  }

  try {
    const headers = {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json'
    };

    // Step 1: Upload design file to Printful
    let designFileUrl = designFile.export_url || designFile.file_path;

    if (designFile.file_path && !designFile.export_url) {
      // Upload local file to Printful
      const uploadResult = await uploadDesignToPrintful(designFile.file_path, headers);
      designFileUrl = uploadResult.url;
    }

    // Step 2: Create sync product
    const productPayload = {
      sync_product: {
        name: product_name,
        thumbnail: designFileUrl
      },
      sync_variants: await createProductVariants(designFileUrl, price)
    };

    const response = await axios.post(
      `${PRINTFUL_API_BASE}/store/products`,
      productPayload,
      { headers }
    );

    const product = response.data.result;

    // Save product metadata
    saveProductMetadata(product_name, product);

    return {
      success: true,
      product_id: product.id,
      sync_product_id: product.sync_product.id,
      name: product.sync_product.name,
      variants_created: product.sync_variants.length,
      retail_price: price,
      dashboard_url: `https://www.printful.com/dashboard/sync-products/${product.id}`,
      auto_listed: true,
      created_at: new Date().toISOString()
    };

  } catch (error) {
    console.error("Printful listing error:", error.response?.data || error.message);

    // Return mock listing with instructions if API fails
    return createMockListing(productData, error.message);
  }
}

/**
 * Upload design file to Printful
 */
async function uploadDesignToPrintful(filePath, headers) {
  const FormData = (await import('form-data')).default;
  const fs = (await import('fs')).default;

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  form.append('type', 'default');

  const response = await axios.post(
    `${PRINTFUL_API_BASE}/files`,
    form,
    {
      headers: {
        ...headers,
        ...form.getHeaders()
      }
    }
  );

  return {
    id: response.data.result.id,
    url: response.data.result.url,
    thumbnail_url: response.data.result.thumbnail_url,
    preview_url: response.data.result.preview_url
  };
}

/**
 * Create product variants (sizes and colors)
 */
async function createProductVariants(designUrl, retailPrice) {
  const baseProduct = PRODUCT_VARIANTS["bella_canvas_3001"];
  const variants = [];

  // Create variants for common sizes in Black
  const sizes = ['S', 'M', 'L', 'XL', '2XL'];

  for (const size of sizes) {
    variants.push({
      variant_id: baseProduct.sizes[size],
      retail_price: retailPrice,
      files: [
        {
          url: designUrl,
          type: 'default' // Front placement
        }
      ]
    });
  }

  return variants;
}

/**
 * Batch create multiple products
 */
export async function batchCreateProducts(products, designs) {
  const results = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const design = designs[i];

    try {
      const listing = await createPrintfulProduct(product, design);
      results.push({
        product: product.product_name,
        status: 'success',
        listing
      });

      // Rate limiting - Printful allows 120 requests per minute
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      results.push({
        product: product.product_name,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Get product status from Printful
 */
export async function getProductStatus(productId) {
  if (!PRINTFUL_API_KEY) {
    return { status: 'api_not_configured' };
  }

  try {
    const headers = {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`
    };

    const response = await axios.get(
      `${PRINTFUL_API_BASE}/store/products/${productId}`,
      { headers }
    );

    return {
      success: true,
      product: response.data.result,
      status: 'listed'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: 'error'
    };
  }
}

/**
 * Update product pricing
 */
export async function updateProductPricing(productId, newPrice) {
  if (!PRINTFUL_API_KEY) {
    throw new Error("Printful API key not configured");
  }

  const headers = {
    'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // Get current product
    const getResponse = await axios.get(
      `${PRINTFUL_API_BASE}/store/products/${productId}`,
      { headers }
    );

    const product = getResponse.data.result;

    // Update variant prices
    const updatedVariants = product.sync_variants.map(variant => ({
      id: variant.id,
      retail_price: newPrice
    }));

    // Update product
    const updateResponse = await axios.put(
      `${PRINTFUL_API_BASE}/store/products/${productId}`,
      {
        sync_variants: updatedVariants
      },
      { headers }
    );

    return {
      success: true,
      product_id: productId,
      new_price: newPrice,
      variants_updated: updatedVariants.length
    };

  } catch (error) {
    console.error("Update pricing error:", error.message);
    throw error;
  }
}

/**
 * Delete product from Printful
 */
export async function deleteProduct(productId) {
  if (!PRINTFUL_API_KEY) {
    throw new Error("Printful API key not configured");
  }

  const headers = {
    'Authorization': `Bearer ${PRINTFUL_API_KEY}`
  };

  try {
    await axios.delete(
      `${PRINTFUL_API_BASE}/store/products/${productId}`,
      { headers }
    );

    return {
      success: true,
      product_id: productId,
      deleted: true
    };

  } catch (error) {
    console.error("Delete product error:", error.message);
    throw error;
  }
}

/**
 * Get store info
 */
export async function getStoreInfo() {
  if (!PRINTFUL_API_KEY) {
    return {
      success: false,
      error: "Printful API key not configured"
    };
  }

  try {
    const headers = {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`
    };

    const response = await axios.get(
      `${PRINTFUL_API_BASE}/store`,
      { headers }
    );

    return {
      success: true,
      store: response.data.result
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create mock listing (fallback)
 */
function createMockListing(productData, errorMessage = null) {
  const mockProductId = `mock_${Date.now()}`;

  return {
    success: false,
    product_id: mockProductId,
    name: productData.product_name,
    retail_price: productData.price,
    auto_listed: false,
    manual_listing_required: true,
    error: errorMessage,
    printful_instructions: {
      steps: [
        "1. Log in to Printful dashboard: https://www.printful.com/dashboard",
        "2. Click 'Add Product' → 'Create Manually'",
        "3. Select 'Bella + Canvas 3001' (Unisex T-Shirt)",
        "4. Upload your downloaded design PNG",
        "5. Position design on shirt (centered, front placement)",
        `6. Set product name: "${productData.product_name}"`,
        `7. Set retail price: $${productData.price}`,
        "8. Select sizes: S, M, L, XL, 2XL",
        "9. Select colors: Black (recommended for visibility)",
        "10. Click 'Proceed to mockups'",
        "11. Generate mockups",
        "12. Click 'Submit to my store'",
        "13. Product is now live and ready to sell!"
      ],
      estimated_time: "2-3 minutes",
      dashboard_url: "https://www.printful.com/dashboard/products/create"
    },
    created_at: new Date().toISOString()
  };
}

/**
 * Save product metadata
 */
function saveProductMetadata(productName, product) {
  const metadataDir = join(process.cwd(), 'data', 'product-metadata');
  if (!existsSync(metadataDir)) {
    mkdirSync(metadataDir, { recursive: true });
  }

  const metadata = {
    product_name: productName,
    product_id: product.id,
    sync_product_id: product.sync_product?.id,
    created_at: new Date().toISOString(),
    status: 'listed'
  };

  const fileName = `${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  const filePath = join(metadataDir, fileName);

  writeFileSync(filePath, JSON.stringify(metadata, null, 2));
}

/**
 * Get product catalog
 */
export async function getProductCatalog() {
  if (!PRINTFUL_API_KEY) {
    return {
      success: false,
      error: "Printful API key not configured"
    };
  }

  try {
    const headers = {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`
    };

    const response = await axios.get(
      `${PRINTFUL_API_BASE}/products`,
      { headers }
    );

    return {
      success: true,
      products: response.data.result
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  createPrintfulProduct,
  batchCreateProducts,
  getProductStatus,
  updateProductPricing,
  deleteProduct,
  getStoreInfo,
  getProductCatalog
};
