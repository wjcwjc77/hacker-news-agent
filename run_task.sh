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

# Execute the claude command with the prompt
log "Processing with Claude AI..."

# Set the current hour for the task
CURRENT_HOUR=$(date '+%Y-%m-%d %H:00')

# Execute claude with enhanced prompt including current hour
cat "$SCRIPT_DIR/task_prompt.md" | sed "s|\$CURRENT_DIR|$SCRIPT_DIR|g" | claude -p "Execute the task described in the prompt file. The current date/time is ${CURRENT_HOUR}."
log "Task completed successfully"
