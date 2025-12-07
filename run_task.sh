#!/bin/bash

# run_task.sh - Execute the AI topic extraction and email task

set -e

# Set PATH to include NVM paths for cron environment
export PATH="/root/.nvm/versions/node/v24.11.1/bin:$PATH"

LOG_FILE="/root/hn/task.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

# Execute the claude command with the prompt
log "Processing with Claude AI..."

# Set the current hour for the task
CURRENT_HOUR=$(date '+%Y-%m-%d %H:00')

# Execute claude with enhanced prompt including current hour
cat /root/hn/task_prompt.md  | claude -p "Execute the task described in the prompt file. The current date/time is ${CURRENT_HOUR}."

log "Task completed successfully"
