#!/bin/bash

SESSION="dev"

tmux kill-session -t $SESSION 2>/dev/null

tmux new-session -d -s $SESSION -n main
tmux send-keys -t $SESSION "cd server && npm install && nodemon index.js" C-m

tmux split-window -h -t $SESSION
tmux send-keys -t $SESSION "cd client && npm install && npm run dev" C-m

tmux select-layout -t $SESSION even-horizontal

tmux attach -t $SESSION
