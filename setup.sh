#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
cd /home/bruno/arkon-game/src/client
npm install > /home/bruno/arkon-game/npm-install.log 2>&1
echo "EXIT:$?" >> /home/bruno/arkon-game/npm-install.log
