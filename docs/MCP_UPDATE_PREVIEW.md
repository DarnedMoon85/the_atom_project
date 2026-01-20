# MCP Configuration Update Preview

## Current mcp.json Structure

Location: `~/.cursor/mcp.json`

**Current State** (with comments):
```json
{
  "mcpServers": {
    "console-ninja": {
      "command": "node",
      "args": ["~/.console-ninja/mcp/"]
    },
    /* SOVEREIGN_PENDING: Supabase/Postgres Integration */
    /*"postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "PENDING_CONNECTION_STRING"
      ]
    },*/
    /* SOVEREIGN_PENDING: Sequential Thinking for CEO Protocol Validation */
    /*"sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    },*/
  }
}
```

## Updated mcp.json Structure (After Activation)

**Target State** (when Supabase credentials are available):
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
        "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
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

## Update Process

### When Supabase Credentials Are Available:

1. **Set Environment Variables**:
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   export SUPABASE_DB_PASSWORD="your-database-password"
   ```

2. **Run Update Script**:
   ```bash
   npm run update-mcp
   ```

3. **Or Manual Update**:
   - Open `~/.cursor/mcp.json`
   - Uncomment `postgres` server block
   - Replace `PENDING_CONNECTION_STRING` with actual PostgreSQL connection string
   - Uncomment `sequential-thinking` server block
   - Save file
   - Restart Cursor

### PostgreSQL Connection String Format

For Supabase, the connection string format is:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Where:
- `[PROJECT_REF]` is extracted from your Supabase URL (e.g., `abcdefghijklmnop` from `https://abcdefghijklmnop.supabase.co`)
- `[PASSWORD]` is your database password (found in Supabase Dashboard > Settings > Database)
- `[REGION]` is your Supabase region (e.g., `us-east-1`)

## Verification

After updating mcp.json:
1. Restart Cursor to load new MCP servers
2. Verify PostgreSQL MCP is accessible
3. Use Sequential Thinking MCP to verify protocol enforcement
4. Log activation in `docs/SOVEREIGN_BACKLOG.md`

## Security Reminders

- Never commit `mcp.json` to version control
- Verify `.gitignore` excludes `~/.cursor/mcp.json`
- Keep database password secure
- Use environment variables for sensitive data
