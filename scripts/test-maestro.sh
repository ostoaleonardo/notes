#!/usr/bin/env bash
export PATH="$PATH:$HOME/.maestro/bin"

adb reverse tcp:8081 tcp:8081 || true
bash "$(dirname "$0")/reset-maestro-state.sh" || true
maestro test "${@:-.maestro}"
status=$?

adb shell 'rm -f /sdcard/Documents/*/.trash/Untitled*.md /sdcard/Documents/*/.trash/maestro-*.md /sdcard/Documents/*/maestro-*.md' || true

exit $status
