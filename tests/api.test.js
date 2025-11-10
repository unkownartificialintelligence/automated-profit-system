import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import axios from 'axios';

const BASE_URL = 'http://localhost:3003';

describe('Automated Profit System - API Tests', () => {
  describe('Health Check Endpoints', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.checks.server.status, 'healthy');
      assert.strictEqual(response.data.checks.database.status, 'healthy');
    });

    it('should include system metrics', async () => {
      const response = await axios.get(`${BASE_URL}/api/health`);

      assert.ok(response.data.uptime);
      assert.ok(response.data.system);
      assert.ok(response.data.system.memory);
      assert.ok(response.data.system.nodeVersion);
    });
  });

  describe('Personal Dashboard', () => {
    it('should return owner dashboard', async () => {
      const response = await axios.get(`${BASE_URL}/api/dashboard`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.strictEqual(response.data.user_type, 'owner');
      assert.strictEqual(response.data.profit_share, 0);
    });

    it('should have sales summary', async () => {
      const response = await axios.get(`${BASE_URL}/api/dashboard`);

      assert.ok(response.data.summary);
      assert.ok(typeof response.data.summary.total_sales === 'number');
      assert.ok(typeof response.data.summary.total_profit === 'number');
    });
  });

  describe('Christmas Automation', () => {
    it('should return christmas dashboard', async () => {
      const response = await axios.get(`${BASE_URL}/api/christmas/dashboard`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.ok(response.data.overview);
    });

    it('should return today\'s products', async () => {
      const response = await axios.get(`${BASE_URL}/api/christmas/today`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.ok(Array.isArray(response.data.data.products));
      assert.ok(response.data.data.products.length > 0);
    });

    it('should return revenue projection', async () => {
      const response = await axios.get(`${BASE_URL}/api/christmas/revenue`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.ok(response.data.projection);
      assert.ok(response.data.projection.total_profit);
    });

    it('should return design specs for product', async () => {
      const response = await axios.get(`${BASE_URL}/api/christmas/design/0`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.ok(response.data.design_instructions);
      assert.ok(response.data.design_instructions.canva_steps);
    });

    it('should return marketing campaign', async () => {
      const response = await axios.get(`${BASE_URL}/api/christmas/marketing/0`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.ok(response.data.instagram_post);
      assert.ok(response.data.email_template);
    });
  });

  describe('Marketing Automation', () => {
    it('should return marketing dashboard', async () => {
      const response = await axios.get(`${BASE_URL}/api/marketing/dashboard`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.strictEqual(response.data.overview.total_campaigns_available, 11);
      assert.strictEqual(response.data.overview.total_stakeholder_types, 5);
    });

    it('should list team campaigns', async () => {
      const response = await axios.get(`${BASE_URL}/api/marketing/team`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.ok(Array.isArray(response.data.campaigns));
      assert.strictEqual(response.data.campaigns.length, 2);
    });

    it('should generate customer product launch campaign', async () => {
      const response = await axios.get(`${BASE_URL}/api/marketing/customers/product_launch`);

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data.success, true);
      assert.ok(response.data.campaign);
      assert.ok(response.data.campaign.email);
    });

    it('should support custom variables in campaigns', async () => {
      const response = await axios.get(
        `${BASE_URL}/api/marketing/customers/product_launch?product_name=Test+Product&price=29.99`
      );

      assert.strictEqual(response.status, 200);
      assert.ok(response.data.campaign.email.body.includes('Test Product'));
    });

    it('should list all stakeholder types', async () => {
      const stakeholders = ['team', 'customers', 'clients', 'partnerships', 'sponsorships'];

      for (const stakeholder of stakeholders) {
        const response = await axios.get(`${BASE_URL}/api/marketing/${stakeholder}`);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.success, true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid product index', async () => {
      try {
        await axios.get(`${BASE_URL}/api/christmas/design/999`);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.strictEqual(error.response.status, 404);
      }
    });

    it('should handle invalid stakeholder type', async () => {
      try {
        await axios.get(`${BASE_URL}/api/marketing/invalid_type`);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.strictEqual(error.response.status, 404);
      }
    });

    it('should handle invalid campaign type', async () => {
      try {
        await axios.get(`${BASE_URL}/api/marketing/team/invalid_campaign`);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.strictEqual(error.response.status, 404);
      }
    });
  });

  describe('Performance', () => {
    it('should respond to health check quickly', async () => {
      const start = Date.now();
      await axios.get(`${BASE_URL}/api/health`);
      const duration = Date.now() - start;

      assert.ok(duration < 1000, `Health check took ${duration}ms, should be under 1000ms`);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        axios.get(`${BASE_URL}/api/christmas/today`)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.success, true);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should have consistent product data', async () => {
      const todayResponse = await axios.get(`${BASE_URL}/api/christmas/today`);
      const allResponse = await axios.get(`${BASE_URL}/api/christmas/all`);

      assert.ok(todayResponse.data.data.products.length > 0);
      assert.ok(allResponse.data.products.length >= todayResponse.data.data.products.length);
    });

    it('should have valid profit calculations', async () => {
      const response = await axios.get(`${BASE_URL}/api/dashboard`);
      const { total_sales, total_profit } = response.data.summary;

      if (total_sales > 0) {
        assert.ok(total_profit >= 0, 'Profit should be non-negative');
      }
    });

    it('should have consistent revenue projections', async () => {
      const response = await axios.get(`${BASE_URL}/api/christmas/revenue`);
      const { total_estimated_sales, total_profit, total_products } = response.data.projection;

      assert.ok(total_estimated_sales > 0);
      assert.ok(total_products === 10);
      assert.ok(total_profit.includes('$'));
    });
  });
});

// Run all tests
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Running Automated Profit System Tests...');
  console.log('📊 Ensure server is running on http://localhost:3003\n');
}
