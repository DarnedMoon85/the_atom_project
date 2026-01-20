# MCP Activation Plan

## Current Status

MCP configuration file located at: `~/.cursor/mcp.json`

**Current State**:
- `console-ninja`: ✅ Active
- `postgres`: ⏳ Commented out, awaiting Supabase credentials
- `sequential-thinking`: ⏳ Commented out, awaiting activation
- `brave-search`: ⏳ Commented out, awaiting API key

## Activation Steps

### 1. Supabase/PostgreSQL MCP Activation

**Prerequisites**:
- Supabase project created
- Database password obtained from Supabase Dashboard > Settings > Database
- Environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_DB_PASSWORD` (for PostgreSQL connection string)

**Activation Method**:

**Option A: Automatic (Recommended)**
```bash
# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_DB_PASSWORD="your-db-password"

# Run update script
npm run update-mcp
```

**Option B: Manual**
1. Open `~/.cursor/mcp.json`
2. Uncomment the `postgres` server block
3. Replace `PENDING_CONNECTION_STRING` with:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   Where `[project-ref]` is extracted from your Supabase URL and `[password]` is your database password

### 2. Sequential Thinking MCP Activation

**Activation**:
1. Open `~/.cursor/mcp.json`
2. Uncomment the `sequential-thinking` server block
3. Save file
4. Restart Cursor to load MCP servers

**Verification**:
- Use Sequential Thinking MCP to verify 5-Step Protocol sequence
- Test state transition validation
- Verify no shortcuts are possible

### 3. MCP Configuration Structure (After Activation)

```json
{
  "mcpServers": {
    "console-ninja": {
      "command": "node",
      "args": ["~/.console-ninja/mcp/"]
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
      ]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    }
  }
}
```

## Security Notes

- `mcp.json` must NEVER be committed to version control
- Verify `.gitignore` includes `~/.cursor/mcp.json` or `.cursor/mcp.json`
- Database password should be kept secure
- Use environment variables for sensitive data

## Logging

All MCP activations will be logged to `docs/SOVEREIGN_BACKLOG.md` under the "Completed" section with:
- Timestamp
- Service name
- Update type
- Success/failure status
