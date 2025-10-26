#!/bin/bash

SESSION="dev"
CURR_DIR=$(pwd)

tmux kill-session -t $SESSION 2>/dev/null

tmux new-session -d -s $SESSION -n main
tmux send-keys -t $SESSION "cd $CURR_DIR/server && npm install && nodemon index.js" C-m

tmux split-window -h -t $SESSION
tmux send-keys -t $SESSION "cd $CURR_DIR/client && npm install && npm run dev" C-m

tmux select-layout -t $SESSION even-horizontal

tmux attach -t $SESSION
