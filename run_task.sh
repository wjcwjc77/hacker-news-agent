#!/bin/bash

# run_task.sh - Execute the AI topic extraction and email task

set -e

# Get the absolute path of the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set PATH to include NVM paths for cron environment
export PATH="/root/.nvm/versions/node/v24.11.1/bin:$PATH"

LOG_FILE="$SCRIPT_DIR/task.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

# Generate timestamp for fetch output file (format: YYYYMMDD_HH)
FETCH_TIMESTAMP=$(date +%Y%m%d_%H)
OUTPUT_FILE="$SCRIPT_DIR/fetch_output_${FETCH_TIMESTAMP}.json"

log "Generated timestamp: $FETCH_TIMESTAMP"

# Execute the claude command with the prompt
log "Processing with Claude AI..."

# Execute claude with fetch agent to get AI topics
cat "$SCRIPT_DIR/task_prompt.md" | \
  sed "s|\$CURRENT_DIR|$SCRIPT_DIR|g" | \
  sed "s|YYYYMMDD_HH|$FETCH_TIMESTAMP|g" | \
  claude -p "Execute the task described in the prompt file directly. Use TIMESTAMP=$FETCH_TIMESTAMP" --debug

log "Fetch completed, using output file: $OUTPUT_FILE"

# Send email using the fetched data
log "Sending email with fetched data..."

node "$SCRIPT_DIR/send-email/build/index.js" \
  --data "$(cat "$OUTPUT_FILE")"

log "Task completed successfully"
