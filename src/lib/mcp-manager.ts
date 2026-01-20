/**
 * MCP Manager - Environmental Authority
 * Handles MCP configuration updates per PILLAR V: INTEGRITY
 */

import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

interface MCPServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

/**
 * Read current MCP configuration
 */
export function readMCPConfig(): MCPConfig | null {
  const mcpPath = path.join(homedir(), '.cursor', 'mcp.json');
  
  try {
    if (!fs.existsSync(mcpPath)) {
      return null;
    }
    
    const content = fs.readFileSync(mcpPath, 'utf-8');
    // Remove comments before parsing JSON
    const jsonContent = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Error reading mcp.json:', error);
    return null;
  }
}

/**
 * Validate connection string format
 */
export function validateConnectionString(connectionString: string, type: 'postgresql' | 'supabase'): boolean {
  if (!connectionString || connectionString.trim().length === 0) {
    return false;
  }

  if (type === 'postgresql') {
    // PostgreSQL URI format: postgresql://user:password@host:port/database
    const postgresPattern = /^postgresql:\/\/.+/i;
    return postgresPattern.test(connectionString);
  }

  if (type === 'supabase') {
    // Supabase URL format: https://project.supabase.co
    const supabasePattern = /^https:\/\/.+\.supabase\.co/i;
    return supabasePattern.test(connectionString);
  }

  return false;
}

/**
 * Validate API key format
 */
export function validateApiKey(apiKey: string, service: string): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  // Basic validation - non-empty string with reasonable length
  if (apiKey.length < 10) {
    return false;
  }

  return true;
}

/**
 * Update MCP configuration with Supabase credentials
 */
export async function updateMCPConfigWithSupabase(): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found. Cannot update MCP config.');
    return false;
  }

  // Validate credentials
  if (!validateConnectionString(supabaseUrl, 'supabase')) {
    console.error('Invalid Supabase URL format');
    return false;
  }

  if (!validateApiKey(supabaseAnonKey, 'supabase')) {
    console.error('Invalid Supabase API key format');
    return false;
  }

  const mcpPath = path.join(homedir(), '.cursor', 'mcp.json');
  
  try {
    // Read current config
    const currentContent = fs.readFileSync(mcpPath, 'utf-8');
    let updatedContent = currentContent;

    // Build PostgreSQL connection string from Supabase URL
    // Extract project reference from Supabase URL
    const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!urlMatch) {
      console.error('Could not extract project reference from Supabase URL');
      return false;
    }

    const projectRef = urlMatch[1];
    // Supabase connection string format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    // For MCP, we'll use the direct connection string
    // Note: This requires the database password, which may not be in env vars
    // For now, we'll use a placeholder that needs to be filled manually or from a different env var
    
    const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'PENDING_DB_PASSWORD';
    const dbHost = process.env.SUPABASE_DB_HOST || `aws-0-us-east-1.pooler.supabase.com`;
    
    // Try to construct connection string, but if password is pending, use a different approach
    let postgresConnectionString = 'PENDING';
    if (dbPassword !== 'PENDING_DB_PASSWORD') {
      postgresConnectionString = `postgresql://postgres.${projectRef}:${dbPassword}@${dbHost}:6543/postgres?pgbouncer=true`;
    }

    // Update postgres server config
    if (updatedContent.includes('PENDING_CONNECTION_STRING')) {
      // Uncomment postgres server and replace PENDING_CONNECTION_STRING
      updatedContent = updatedContent.replace(
        /\/\*\s*"postgres":\s*\{[\s\S]*?"PENDING_CONNECTION_STRING"[\s\S]*?\}\s*,?\s*\*\//,
        `"postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${postgresConnectionString}"
      ]
    },`
      );
    }

    // Uncomment sequential-thinking server
    if (updatedContent.includes('SOVEREIGN_PENDING: Sequential Thinking')) {
      updatedContent = updatedContent.replace(
        /\/\*\s*"sequential-thinking":\s*\{[\s\S]*?\}\s*,?\s*\*\//,
        `"sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    },`
      );
    }

    // Write updated config
    fs.writeFileSync(mcpPath, updatedContent, 'utf-8');
    
    // Verify file is not in git (security check)
    const gitIgnorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitIgnorePath)) {
      const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
      if (!gitIgnoreContent.includes('mcp.json') && !gitIgnoreContent.includes('.cursor/mcp.json')) {
        console.warn('WARNING: mcp.json may not be in .gitignore. Please verify it is excluded from version control.');
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating mcp.json:', error);
    return false;
  }
}

/**
 * Log MCP activation to SOVEREIGN_BACKLOG
 */
export async function logMCPActivation(
  service: string,
  updateType: string,
  status: 'success' | 'failure'
): Promise<void> {
  const backlogPath = path.join(process.cwd(), 'docs', 'SOVEREIGN_BACKLOG.md');
  
  try {
    if (!fs.existsSync(backlogPath)) {
      console.warn('SOVEREIGN_BACKLOG.md not found. Cannot log MCP activation.');
      return;
    }

    let content = fs.readFileSync(backlogPath, 'utf-8');
    
    const timestamp = new Date().toISOString();
    const logEntry = `- [${status === 'success' ? 'x' : ' '}] **${service}** - ${updateType} (${timestamp})`;

    // Find Completed section and add entry
    if (content.includes('## Completed')) {
      const completedIndex = content.indexOf('## Completed');
      const nextSectionIndex = content.indexOf('##', completedIndex + 1);
      
      if (nextSectionIndex === -1) {
        // No next section, append at end
        content += `\n${logEntry}`;
      } else {
        // Insert before next section
        content = content.slice(0, nextSectionIndex) + logEntry + '\n\n' + content.slice(nextSectionIndex);
      }
    } else {
      // Add Completed section
      content += `\n\n## Completed\n\n${logEntry}\n`;
    }

    fs.writeFileSync(backlogPath, content, 'utf-8');
  } catch (error) {
    console.error('Error logging MCP activation:', error);
  }
}
