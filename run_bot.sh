#! /bin/bash
cd /home/claudio/code/personale
concurrently "cd evoluzione_chatbot && npm run dev" "cd langchain/agent-service-toolkit && docker compose watch"
