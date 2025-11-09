# 🔌 MCP Integration Guide
## Model Context Protocol for Automated Profit System

---

## ✅ **MCP VERSION: LATEST (v1.21.1)**

Your automated profit system now includes **Model Context Protocol (MCP)** support, enabling AI assistants to directly interact with your profit system!

---

## 📊 **WHAT IS MCP?**

**Model Context Protocol (MCP)** is an open protocol by Anthropic that standardizes how AI assistants connect to external tools and data sources.

### **Benefits:**
- ✅ **AI Integration**: Claude and other AI assistants can access your profit system
- ✅ **Tool Exposure**: 8 powerful tools for automation management
- ✅ **Real-time Data**: AI gets live data from your system
- ✅ **Automation**: AI can help manage campaigns, products, and analytics

---

## 🛠️ **AVAILABLE MCP TOOLS**

Your MCP server exposes **8 tools** for AI assistants:

### **1. get_christmas_products**
**Purpose:** Get today's trending Christmas products
```
Returns: List of products with pricing, profit, and trend scores
```

### **2. get_product_design_specs**
**Purpose:** Get design specifications for a product
```
Input: product_index (0-9)
Returns: Complete design specifications (colors, concept, Canva steps)
```

### **3. get_marketing_campaign**
**Purpose:** Get marketing campaign for a product
```
Input: product_index (0-9)
Returns: Multi-channel campaigns (Email, Instagram, TikTok, Facebook)
```

### **4. get_dashboard_stats**
**Purpose:** Get personal account stats
```
Returns: Sales, profit, account type, revenue data
```

### **5. get_christmas_revenue_projection**
**Purpose:** Get season revenue projections
```
Returns: Total profit potential, daily averages, season breakdown
```

### **6. generate_stakeholder_campaign**
**Purpose:** Generate marketing campaign for any stakeholder
```
Input:
  - stakeholder: team, customers, clients, partnerships, sponsorships
  - campaign_type: recruitment, product_launch, outreach, etc.
  - custom_data: Personalization variables
Returns: Complete campaign with email, social media, etc.
```

### **7. get_marketing_campaigns_list**
**Purpose:** List all campaigns for a stakeholder
```
Input: stakeholder type
Returns: Available campaigns and their details
```

### **8. get_system_health**
**Purpose:** Get system health and status
```
Returns: Server status, uptime, database health, memory usage
```

---

## 🚀 **SETUP INSTRUCTIONS**

### **Step 1: Ensure Server is Running**
```bash
./deploy.sh
```

Your main server must be running on `localhost:3003` for MCP to work.

### **Step 2: Configure Claude Desktop (or other MCP client)**

**For Claude Desktop on macOS:**
```bash
# Open Claude Desktop config
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**For Claude Desktop on Windows:**
```bash
# Open config at:
%APPDATA%\Claude\claude_desktop_config.json
```

**For Claude Desktop on Linux:**
```bash
# Open config at:
~/.config/Claude/claude_desktop_config.json
```

### **Step 3: Add MCP Server Configuration**

Add this to your Claude Desktop config:

```json
{
  "mcpServers": {
    "automated-profit-system": {
      "command": "node",
      "args": ["/home/user/automated-profit-system/mcp-server.js"],
      "env": {
        "SERVER_URL": "http://localhost:3003"
      }
    }
  }
}
```

**⚠️ Important:** Update the path `/home/user/automated-profit-system/mcp-server.js` to match your actual installation path!

### **Step 4: Restart Claude Desktop**

Close and reopen Claude Desktop for the changes to take effect.

### **Step 5: Verify Connection**

In Claude Desktop, you should see your MCP server listed. Try asking:

```
"Can you show me today's Christmas products?"
"What's my dashboard stats?"
"Generate a team recruitment campaign"
```

Claude will use the MCP tools to fetch real data from your system!

---

## 💻 **MANUAL MCP SERVER USAGE**

### **Start MCP Server Standalone:**
```bash
npm run mcp
```

### **Test MCP Server:**
```bash
# Ensure your main server is running first
./deploy.sh

# In another terminal, test MCP
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node mcp-server.js
```

---

## 🎯 **USE CASES**

### **Use Case 1: AI-Assisted Product Launch**

**You:** "Claude, what Christmas products are ready to launch today?"

**Claude uses MCP tool:** `get_christmas_products`

**Claude responds:** "You have 3 products ready:
1. Meowy Christmas Cat Dad Shirt - $12.04 profit/sale
2. Retro Ugly Christmas Sweater - $15.04 profit/sale
3. Christmas Squad Family Matching - $10.04 profit/sale

Would you like design specs or marketing campaigns for any of these?"

---

### **Use Case 2: Campaign Generation**

**You:** "Generate a partnership outreach campaign for 'Print Supply Co'"

**Claude uses MCP tool:** `generate_stakeholder_campaign` with custom data

**Claude responds:** Complete partnership proposal email with:
- Personalized to Print Supply Co
- Revenue projections
- Partnership benefits
- Professional copy ready to send

---

### **Use Case 3: Performance Monitoring**

**You:** "How's my system performing?"

**Claude uses MCP tools:** `get_dashboard_stats` + `get_system_health` + `get_christmas_revenue_projection`

**Claude responds:**
"Your system is healthy! Here's your status:
- Server: Running (uptime: 3 hours)
- Sales: 1 order ($12.04 profit)
- Season projection: $9,042.74
- Products available: 10

Everything looks good! Your Christmas campaign is on track."

---

### **Use Case 4: Marketing Automation**

**You:** "Create a product launch campaign for the Cat Dad shirt"

**Claude uses MCP tools:** `get_product_design_specs(0)` + `get_marketing_campaign(0)`

**Claude responds:** Complete multi-channel campaign:
- Email subject & body
- Instagram caption & hashtags
- TikTok video script
- Facebook post
- All personalized and ready to copy/paste!

---

## 📚 **MCP TOOL REFERENCE**

### **Tool: get_christmas_products**
```json
{
  "name": "get_christmas_products",
  "description": "Get today's trending Christmas products ready to launch",
  "inputSchema": {
    "type": "object",
    "properties": {}
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "week": 1,
    "products": [
      {
        "product_name": "Meowy Christmas Cat Dad T-Shirt",
        "price_recommendation": "$24.99",
        "profit_per_sale": "$12.04",
        "trend_score": 92,
        "estimated_daily_sales": "5-8"
      }
    ]
  }
}
```

---

### **Tool: get_product_design_specs**
```json
{
  "name": "get_product_design_specs",
  "description": "Get design specifications for a specific Christmas product",
  "inputSchema": {
    "type": "object",
    "properties": {
      "product_index": {
        "type": "number",
        "description": "Product index (0-9)"
      }
    },
    "required": ["product_index"]
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "product_name": "Meowy Christmas Cat Dad T-Shirt",
  "design_instructions": {
    "concept": "Cat wearing Santa hat with 'MEOWY CHRISTMAS' text",
    "colors": ["#C41E3A", "#165B33", "#FFFFFF"],
    "canva_steps": [
      "1. Open Canva.com and login",
      "2. Search for 'T-shirt design template'",
      ...
    ]
  }
}
```

---

### **Tool: generate_stakeholder_campaign**
```json
{
  "name": "generate_stakeholder_campaign",
  "description": "Generate marketing campaign for specific stakeholder type",
  "inputSchema": {
    "type": "object",
    "properties": {
      "stakeholder": {
        "type": "string",
        "enum": ["team", "customers", "clients", "partnerships", "sponsorships"]
      },
      "campaign_type": {
        "type": "string",
        "description": "Campaign type"
      },
      "custom_data": {
        "type": "object",
        "description": "Custom variables"
      }
    },
    "required": ["stakeholder", "campaign_type"]
  }
}
```

**Example Usage:**
```javascript
{
  "stakeholder": "partnerships",
  "campaign_type": "outreach",
  "custom_data": {
    "partner_name": "Alex",
    "partner_business": "Print Supply Co",
    "your_name": "Jordan"
  }
}
```

---

## 🔧 **CONFIGURATION**

### **Environment Variables**

The MCP server uses these environment variables:

```bash
SERVER_URL=http://localhost:3003  # Your main server URL
```

### **MCP Server Configuration File**

Located at: `mcp-config.json`

```json
{
  "mcpServers": {
    "automated-profit-system": {
      "command": "node",
      "args": ["/home/user/automated-profit-system/mcp-server.js"],
      "env": {
        "SERVER_URL": "http://localhost:3003"
      }
    }
  }
}
```

---

## 🚨 **TROUBLESHOOTING**

### **MCP Server Not Connecting**

**Problem:** Claude Desktop doesn't see the MCP server

**Solutions:**
1. Check main server is running:
   ```bash
   ./status.sh
   ```

2. Verify MCP server path in config is correct

3. Check Claude Desktop config location:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

4. Restart Claude Desktop completely

---

### **MCP Tools Return Errors**

**Problem:** Tools return error messages

**Solutions:**
1. Ensure main server is running:
   ```bash
   curl http://localhost:3003/api/health
   ```

2. Check server logs:
   ```bash
   tail -f /tmp/server.log
   ```

3. Verify port 3003 is accessible:
   ```bash
   lsof -ti:3003
   ```

---

### **Connection Refused Errors**

**Problem:** MCP server can't connect to main server

**Solutions:**
1. Start main server:
   ```bash
   ./deploy.sh
   ```

2. Check firewall settings

3. Verify SERVER_URL in MCP config matches your server

---

## 📦 **FILES CREATED**

### **New Files:**
1. **mcp-server.js** - MCP server implementation
2. **mcp-config.json** - MCP configuration template
3. **MCP_INTEGRATION.md** - This documentation

### **Updated Files:**
1. **package.json** - Added MCP script and SDK dependency

### **Dependencies Added:**
```json
"@modelcontextprotocol/sdk": "^1.21.1"
```

---

## 🎯 **BENEFITS OF MCP INTEGRATION**

### **For You:**
- ✅ **AI Assistant**: Claude can help manage your profit system
- ✅ **Natural Language**: Ask questions in plain English
- ✅ **Automation**: AI can generate campaigns on demand
- ✅ **Data Access**: Real-time access to your profit data
- ✅ **Time Saving**: AI handles repetitive tasks

### **For Your Team:**
- ✅ **Easy Onboarding**: Team members can ask AI for help
- ✅ **Self-Service**: AI provides instant answers
- ✅ **Consistency**: AI uses official data from your system
- ✅ **Scalability**: Handle more requests with AI assistance

### **For Your Business:**
- ✅ **24/7 Access**: AI available anytime
- ✅ **Faster Decisions**: Instant data and campaign generation
- ✅ **Better Campaigns**: AI helps optimize content
- ✅ **Reduced Errors**: AI uses exact system data

---

## 🚀 **ADVANCED USAGE**

### **Chaining Multiple Tools**

Claude can chain multiple MCP tools together:

**You:** "Show me the best product to launch today and create a complete launch plan"

**Claude:**
1. Calls `get_christmas_products` to see all products
2. Analyzes trend scores and profit potential
3. Calls `get_product_design_specs` for the best one
4. Calls `get_marketing_campaign` for the same product
5. Presents complete launch plan with design + marketing

---

### **Custom Data Injection**

You can provide custom variables for campaigns:

**You:** "Generate a partnership proposal for 'Tech Supplies Inc' from me, Jordan Smith"

**Claude calls:**
```javascript
generate_stakeholder_campaign({
  stakeholder: "partnerships",
  campaign_type: "outreach",
  custom_data: {
    "partner_name": "Tech Supplies Inc Contact",
    "partner_business": "Tech Supplies Inc",
    "your_name": "Jordan Smith",
    "company_name": "Automated Profit System"
  }
})
```

**Result:** Fully personalized proposal ready to send!

---

## 📊 **MCP TOOL USAGE EXAMPLES**

### **Example 1: Quick Dashboard Check**
```
You: "What's my current profit?"

Claude uses: get_dashboard_stats

Response: "You currently have $12.04 in profit from 1 sale.
Your account is in Owner mode with 100% profit retention."
```

---

### **Example 2: Product Research**
```
You: "What products should I launch this week?"

Claude uses: get_christmas_products + get_christmas_revenue_projection

Response: "This week you should launch 3 products:
1. Retro Ugly Christmas Sweater ($1,052/week profit potential)
2. Meowy Christmas Cat Dad Shirt ($547/week profit)
3. Christmas Squad Family Matching ($562/week profit)

Total potential: $2,162.86 this week."
```

---

### **Example 3: Complete Campaign Creation**
```
You: "Create everything I need to launch the Cat Dad shirt"

Claude uses:
- get_product_design_specs(0)
- get_marketing_campaign(0)

Response: Provides complete package:
- Design specifications for Canva
- Email campaign
- Instagram post
- TikTok script
- Facebook post
- All ready to use!
```

---

## 🎉 **SUMMARY**

Your automated profit system now includes:

```
✅ MCP SDK: v1.21.1 (Latest)
✅ MCP Server: 8 powerful tools
✅ AI Integration: Claude Desktop compatible
✅ Real-time Data: Live access to your system
✅ Multi-tool: All system features exposed
✅ Documentation: Complete setup guide
✅ Configuration: Easy Claude Desktop integration
```

---

## 📚 **NEXT STEPS**

### **1. Configure Claude Desktop**
- Add MCP server to Claude Desktop config
- Restart Claude Desktop
- Test with "Show me today's products"

### **2. Explore MCP Tools**
- Try all 8 tools via Claude
- Experiment with custom data
- Chain multiple tools together

### **3. Automate Your Workflow**
- Let AI generate campaigns
- Use AI for daily product checks
- Get AI help with performance monitoring

---

## 🔗 **RESOURCES**

**Documentation:**
- MCP_INTEGRATION.md (this file)
- MARKETING_AUTOMATION.md
- CHRISTMAS_PROFIT_SYSTEM.md
- DEPLOY.md

**MCP Resources:**
- Anthropic MCP Docs: https://modelcontextprotocol.io
- MCP SDK: https://github.com/modelcontextprotocol/sdk

**Your System:**
- Main Server: http://localhost:3003
- MCP Server: `npm run mcp`
- Status Check: `./status.sh`

---

**🎊 Your profit system is now MCP-enabled! Use AI to supercharge your automation!** 🚀
