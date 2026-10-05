#!/usr/bin/env bash
export PATH="$PATH:$HOME/.maestro/bin"

adb reverse tcp:8081 tcp:8081 || true
maestro test "${@:-.maestro}"
status=$?

adb shell 'rm -f /sdcard/Documents/*/.trash/Untitled*.md /sdcard/Documents/*/.trash/maestro-*.md /sdcard/Documents/*/maestro-*.md' || true

exit $status
