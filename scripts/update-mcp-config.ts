/**
 * MCP Configuration Update Script
 * Updates ~/.cursor/mcp.json with Supabase credentials
 * Run this after Supabase project is created and credentials are available
 */

import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

const MCP_PATH = path.join(homedir(), '.cursor', 'mcp.json');

interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

function validateSupabaseUrl(url: string): boolean {
  return /^https:\/\/.+\.supabase\.co/i.test(url);
}

function validateApiKey(key: string): boolean {
  return key && key.length >= 20;
}

function updateMCPConfig(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseDbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
    process.exit(1);
  }

  if (!validateSupabaseUrl(supabaseUrl)) {
    console.error('ERROR: Invalid Supabase URL format');
    process.exit(1);
  }

  if (!validateApiKey(supabaseAnonKey)) {
    console.error('ERROR: Invalid Supabase API key format');
    process.exit(1);
  }

  // Read current mcp.json
  let content = fs.readFileSync(MCP_PATH, 'utf-8');

  // Extract project reference from Supabase URL for PostgreSQL connection
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!urlMatch) {
    console.error('ERROR: Could not extract project reference from Supabase URL');
    process.exit(1);
  }

  const projectRef = urlMatch[1];
  
  // Build PostgreSQL connection string
  // Note: This requires the database password which may be in SUPABASE_DB_PASSWORD
  // If not available, we'll use a format that needs to be completed manually
  let postgresConnectionString = 'PENDING';
  if (supabaseDbPassword) {
    // Use connection pooling URL format
    postgresConnectionString = `postgresql://postgres.${projectRef}:${supabaseDbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;
  } else {
    console.warn('WARNING: SUPABASE_DB_PASSWORD not set. PostgreSQL MCP will use PENDING placeholder.');
    console.warn('You can get the database password from Supabase Dashboard > Settings > Database');
  }

  // Uncomment and update postgres server
  content = content.replace(
    /\/\*\s*SOVEREIGN_PENDING: Supabase\/Postgres Integration[\s\S]*?"PENDING_CONNECTION_STRING"[\s\S]*?\}\s*,?\s*\*\//,
    `"postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${postgresConnectionString}"
      ]
    },`
  );

  // Uncomment sequential-thinking server
  content = content.replace(
    /\/\*\s*SOVEREIGN_PENDING: Sequential Thinking[\s\S]*?"sequential-thinking":\s*\{[\s\S]*?\}\s*,?\s*\*\//,
    `"sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    },`
  );

  // Write updated config
  fs.writeFileSync(MCP_PATH, content, 'utf-8');
  console.log('✓ MCP configuration updated successfully');
  console.log('✓ PostgreSQL MCP server activated');
  console.log('✓ Sequential Thinking MCP server activated');
}

// Run if called directly
if (require.main === module) {
  updateMCPConfig();
}

export { updateMCPConfig };
