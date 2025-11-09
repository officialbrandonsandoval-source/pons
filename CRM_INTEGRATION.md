# 🔗 CRM Integration Guide

PONS supports integration with multiple CRM platforms, allowing you to manage contacts, leads, and deals directly from your AI assistant.

## Supported CRM Platforms

### ✅ Currently Available
- **HubSpot** - Full support
- **Salesforce** - Full support

### 🚧 Coming Soon
- **Pipedrive**
- **Zoho CRM**
- **Custom REST API**

## How to Connect

### 1. HubSpot Integration

1. Go to **Settings** in PONS
2. Select **HubSpot** from the CRM dropdown
3. Get your API key:
   - Log in to HubSpot
   - Go to Settings → Integrations → API Key
   - Generate a new private app token
4. Paste the API key and click **Connect**

**Permissions needed:**
- `crm.objects.contacts.read`
- `crm.objects.contacts.write`
- `crm.objects.deals.read`
- `crm.objects.deals.write`

### 2. Salesforce Integration

1. Go to **Settings** in PONS
2. Select **Salesforce** from the CRM dropdown
3. Enter your Salesforce instance URL (e.g., `https://your-domain.salesforce.com`)
4. Get your access token:
   - Use OAuth 2.0 flow (recommended)
   - Or create a Connected App in Salesforce
5. Paste the access token and click **Connect**

**API Access Required:**
- Salesforce API v57.0 or higher
- Read/Write access to Contacts and Opportunities

## Features

### 📊 Contact Management
- View all contacts from your CRM
- Search contacts by name or email
- Real-time sync with your CRM
- View contact details, company, title

### 💼 Deal Tracking
- View all deals/opportunities
- Track deal stages and amounts
- Monitor close dates

### 🤖 AI Integration
Your AI Copilot can interact with your CRM using natural language:

**Example commands:**
```
"Search for contacts named John"
"List my recent contacts"
"Show me my deals"
"Find leads from Acme Corp"
```

## Architecture

PONS uses an **adapter pattern** for CRM integrations:

```
┌─────────────────┐
│   PONS Core     │
└────────┬────────┘
         │
┌────────▼────────┐
│  CRM Manager    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│HubSpot│ │Salesforce│
└──────┘  └────────┘
```

### Benefits:
- **Plug & Play**: Easy to add new CRM adapters
- **Consistent API**: Same interface for all CRMs
- **Type-safe**: Full TypeScript support
- **Extensible**: Add custom CRMs easily

## Adding a Custom CRM

To integrate your own CRM, implement the `ICRMAdapter` interface:

```typescript
import { ICRMAdapter, CRMConfig, CRMContact, CRMDeal } from '@/types/crm'

export class MyCustomCRM implements ICRMAdapter {
  async connect(config: CRMConfig): Promise<boolean> {
    // Your connection logic
  }
  
  async getContacts(limit?: number): Promise<CRMContact[]> {
    // Fetch contacts from your CRM
  }
  
  // ... implement all other methods
}
```

Then register it in `lib/crm/manager.ts`.

## API Reference

See `types/crm.ts` for full TypeScript interfaces:

- `ICRMAdapter` - CRM adapter interface
- `CRMContact` - Contact data structure
- `CRMDeal` - Deal/opportunity structure
- `CRMNote` - Note/activity structure
- `CRMConfig` - Connection configuration

## Security

- API keys are stored in browser localStorage (encrypted in production)
- Tokens are never sent to PONS servers
- All API calls go directly from browser to CRM
- No data is persisted on PONS backend

## Troubleshooting

### Connection Failed
- Verify API key/token is correct
- Check CRM platform permissions
- Ensure API access is enabled in your CRM

### Contacts Not Syncing
- Check your CRM rate limits
- Verify permissions for contacts access
- Try disconnecting and reconnecting

### AI Commands Not Working
- Make sure CRM is connected in Settings
- Check the CRM status indicator
- Try specific commands like "list contacts"

## Roadmap

- [ ] OAuth flow for Salesforce
- [ ] Pipedrive adapter
- [ ] Create/Update contacts from AI
- [ ] Email integration
- [ ] Calendar sync
- [ ] Activity tracking
- [ ] Custom field mapping
- [ ] Webhooks for real-time updates
