# Testing Setup Guide

## Overview
This guide explains how to set up automated testing for the Automated Profit System.

## Why Testing Matters

Testing provides:
- ✅ **Confidence** - Know your code works before deploying
- ✅ **Regression Prevention** - Catch bugs before users do
- ✅ **Documentation** - Tests show how code should work
- ✅ **Faster Development** - Catch issues immediately
- ✅ **Better Design** - Forces modular, testable code

## Testing Strategy

### Test Pyramid

```
       /\
      /  \     E2E Tests (Few)
     /----\    - Full user workflows
    / Unit \   Integration Tests (Some)
   /  Tests \  - API endpoint testing
  /----------\ Unit Tests (Many)
               - Function testing
```

## Quick Start

### 1. Install Testing Dependencies

```bash
npm install --save-dev jest supertest @types/jest
```

### 2. Update package.json

```json
{
  "scripts": {
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "testMatch": ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
    "collectCoverageFrom": [
      "src/**/*.js",
      "!src/server.js",
      "!src/database/init-*.js"
    ]
  }
}
```

### 3. Create Test Directory Structure

```bash
mkdir -p tests/unit tests/integration tests/fixtures
```

## Integration Tests (Start Here)

Test API endpoints to ensure they work correctly.

### Test File: tests/integration/health.test.js

```javascript
import request from 'supertest';
import express from 'express';

// Mock the app setup
const app = express();
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

describe('Health Check Endpoint', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('API is healthy');
  });

  it('should return a timestamp', async () => {
    const response = await request(app).get('/api/health');

    expect(response.body.timestamp).toBeDefined();
    expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
  });
});
```

### Test File: tests/integration/auth.test.js

```javascript
import request from 'supertest';
import app from '../../src/server.js';

describe('Admin Authentication', () => {
  describe('POST /api/admin/login', () => {
    it('should reject login without credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'not-an-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email');
    });

    it('should enforce rate limiting', async () => {
      // Make 6 requests (limit is 5)
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/admin/login')
          .send({
            email: 'test@example.com',
            password: 'wrong'
          });
      }

      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });

      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Too many');
    });
  });
});
```

### Test File: tests/integration/validation.test.js

```javascript
import { sanitizeString, isValidEmail } from '../../src/middleware/validation.js';

describe('Input Validation', () => {
  describe('sanitizeString', () => {
    it('should remove XSS characters', () => {
      const input = '<script>alert("xss")</script>';
      const output = sanitizeString(input);

      expect(output).not.toContain('<');
      expect(output).not.toContain('>');
      expect(output).toBe('scriptalert("xss")/script');
    });

    it('should trim whitespace', () => {
      const input = '  hello world  ';
      const output = sanitizeString(input);

      expect(output).toBe('hello world');
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
    });
  });
});
```

## Unit Tests

Test individual functions in isolation.

### Test File: tests/unit/logger.test.js

```javascript
import logger from '../../src/utils/logger.js';

describe('Logger', () => {
  it('should have required methods', () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should have helper methods', () => {
    expect(logger.logError).toBeDefined();
    expect(logger.logSecurityEvent).toBeDefined();
    expect(logger.logBusinessEvent).toBeDefined();
  });

  it('should log without throwing errors', () => {
    expect(() => {
      logger.info('Test message');
      logger.error('Test error');
      logger.warn('Test warning');
    }).not.toThrow();
  });
});
```

## Database Testing

### Test Database Setup

Create **tests/setup.js**:

```javascript
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

let testDb;

export const setupTestDatabase = async () => {
  testDb = new sqlite3.Database(':memory:');
  const run = promisify(testDb.run.bind(testDb));

  // Create test tables
  await run(`
    CREATE TABLE team_members (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      active INTEGER DEFAULT 1
    )
  `);

  return testDb;
};

export const teardownTestDatabase = async () => {
  if (testDb) {
    await promisify(testDb.close.bind(testDb))();
  }
};

export const clearTestDatabase = async () => {
  const run = promisify(testDb.run.bind(testDb));
  await run('DELETE FROM team_members');
};
```

### Database Test Example

```javascript
import { setupTestDatabase, teardownTestDatabase } from '../setup.js';

describe('Team Members Database', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should create a team member', async () => {
    // Test implementation
  });
});
```

## Test Coverage

### Run Coverage Report

```bash
npm run test:coverage
```

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### View HTML Coverage Report

```bash
open coverage/lcov-report/index.html
```

## Continuous Integration (CI)

### GitHub Actions Setup

Create **.github/workflows/test.yml**:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Test Best Practices

### 1. Follow AAA Pattern

```javascript
it('should do something', () => {
  // Arrange - Set up test data
  const input = 'test';

  // Act - Execute the code
  const result = someFunction(input);

  // Assert - Verify the result
  expect(result).toBe('expected');
});
```

### 2. Use Descriptive Names

```javascript
// ❌ Bad
it('test 1', () => {});

// ✅ Good
it('should return 400 when email is missing', () => {});
```

### 3. Test One Thing

```javascript
// ❌ Bad - Tests multiple things
it('should handle user operations', () => {
  expect(createUser()).toBe(true);
  expect(updateUser()).toBe(true);
  expect(deleteUser()).toBe(true);
});

// ✅ Good - One test per operation
it('should create a user', () => {});
it('should update a user', () => {});
it('should delete a user', () => {});
```

### 4. Mock External Dependencies

```javascript
import axios from 'axios';
jest.mock('axios');

it('should fetch data from API', async () => {
  axios.get.mockResolvedValue({ data: { success: true } });

  const result = await fetchData();

  expect(result.success).toBe(true);
  expect(axios.get).toHaveBeenCalledWith('https://api.example.com');
});
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### Specific Test File
```bash
npm test -- tests/integration/auth.test.js
```

### With Coverage
```bash
npm run test:coverage
```

## Common Testing Scenarios

### Testing Async Code

```javascript
it('should fetch data asynchronously', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### Testing Errors

```javascript
it('should throw error for invalid input', () => {
  expect(() => {
    riskyFunction(null);
  }).toThrow('Invalid input');
});
```

### Testing Promises

```javascript
it('should resolve with data', () => {
  return expect(fetchData()).resolves.toBe('data');
});

it('should reject with error', () => {
  return expect(fetchData()).rejects.toThrow('Error');
});
```

## Next Steps

1. ✅ Install testing dependencies
2. ✅ Create test directory structure
3. ✅ Write first integration test
4. ✅ Set up CI/CD pipeline
5. ✅ Achieve 80% coverage
6. ✅ Add pre-commit hooks for tests

## Resources

- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **Supertest**: https://github.com/visionmedia/supertest
- **Testing Best Practices**: https://testingjavascript.com/

## Test Checklist

- [ ] Health endpoint tests
- [ ] Authentication tests
- [ ] Validation tests
- [ ] Rate limiting tests
- [ ] Error handling tests
- [ ] Database operation tests
- [ ] Security tests (SQL injection, XSS)
- [ ] Integration tests for critical flows
- [ ] CI/CD pipeline configured
- [ ] Coverage > 80%
