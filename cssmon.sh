#!/usr/bin/env bash

# When the files to be monitored are changed, prosody will be restart.

if [[ $# -eq 0 ]]; then
    echo "You need to pass the folders to be monitored.";
    exit 0;
fi

for f in "$@"; do
    if [ ! -f "$f" ]; then
    if [ ! -d "$f" ]; then
        echo "Invalid folder passed: $f";
        exit 0;
    fi
    fi
done

while [ 1 ]; do
    inotifywait -e modify -e create -e close_write -e move --exclude ./css/all.* -r $*;
    make deploy-css;
done
