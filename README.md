# AI Topics Summary Service

## Overview
This service fetches AI-related topics from various sources every 2 hours and sends a formatted summary email. The system uses `claude code` to gather, analyze, and format content into a visually appealing HTML email.

## How It Works

### Workflow
1. **Fetch Data** - Claude code sub agent (you can see prompt in .claude/agents/fetch-agent.md) fetches AI-related topics from various sources
2. **Process Content** - Agent analyzes and selects 10 relevant topics
3. **Generate Email** - Node.js service formats content into HTML and plain text
4. **Send Email** - Email sent via Resend API to configured recipients

### Execution Flow
The system runs on a scheduled cron job that executes `run_task.sh`, which triggers the AI agent workflow and email delivery process.

## Architecture

### Core Components
- **task_prompt.md** - Detailed instructions for the AI agent workflow
- **run_task.sh** - Main execution script that triggers the AI agent
- **send-email/** - Node.js email service for sending formatted emails
  - `index.ts` - TypeScript source code
  - `build/index.js` - Compiled JavaScript for execution
  - `.env.local(cp .env.local.example .env.local)` - Environment configuration
  - `package.json` - Node.js dependencies

## Usage
### Installing
install Claude code, nodejs(lts version is fine), npm

### Updating Configuration
get your resend api key here:https://resend.com/api-keys
and then 
```bash
# Edit environment variables
nano send-email/.env.local

# Rebuild the Node.js service after changes
cd send-email && npm install  && npm run build
```
### Editing Schedule
```bash
# Edit crontab
crontab -e

# Example: Run every 2 hours
# 0 */2 * * * /your absolute path/run_task.sh >> /your absolute path/cron.log 2>&1
```


