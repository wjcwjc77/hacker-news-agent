#!/bin/bash

# run_task.sh - Execute the AI topic extraction and email task (runs every hour)

set -e

# Get the absolute path of the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set environment variables for cron environment
export PATH="/root/.nvm/versions/node/v24.11.1/bin:$PATH"

# Change to the script directory so Claude can find .claude/ config
cd "$SCRIPT_DIR"

LOG_FILE="$SCRIPT_DIR/task.log"

log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Function to handle cleanup on exit
cleanup() {
    log "Received interrupt signal, exiting..."
    exit 0
}

# Trap SIGINT and SIGTERM for graceful shutdown
trap cleanup SIGINT SIGTERM

# Main loop - runs every hour
while true; do
    # Generate timestamp for fetch output file (format: YYYYMMDD_HH)
    FETCH_TIMESTAMP=$(date +%Y%m%d_%H)
    OUTPUT_FILE="$SCRIPT_DIR/fetch_output_${FETCH_TIMESTAMP}.json"

    log "========================================="
    log "Starting new iteration at $FETCH_TIMESTAMP"
    log "========================================="

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
    log "Sleeping for 4 hour before next iteration..."

    # Sleep for 4 hour (14400 seconds)
    sleep 14400
done
