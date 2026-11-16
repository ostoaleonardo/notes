#!/usr/bin/env bash
set -euo pipefail

PACKAGE=${PACKAGE:-com.monospace.notes}
RUNS=${RUNS:-5}
WAIT=${WAIT:-10}
OUT=${OUT:-}
SCENARIOS=${*:-new daily}
ADB=(adb)
[ -n "${DEVICE:-}" ] && ADB=(adb -s "$DEVICE")

measure() {
    "${ADB[@]}" logcat -c
    "${ADB[@]}" shell am force-stop "$PACKAGE"
    sleep 1.5
    "${ADB[@]}" shell am start -a android.intent.action.VIEW -d "notes://notes/$1" >/dev/null
    sleep "$WAIT"
    "${ADB[@]}" logcat -d -v epoch ActivityTaskManager:I ReactNativeJS:V '*:S' | awk '
        { t = $1 + 0 }
        !start && /START u0/ && /VIEW/ { start = t }
        start && !ready && /\[perf\] editor-ready/ && t > start { ready = t }
        END { if (start && ready) printf "%d\n", (ready - start) * 1000; else print "NA" }'
}

result="{"
sep=""
for scenario in $SCENARIOS; do
    values=()
    for _ in $(seq "$RUNS"); do values+=("$(measure "$scenario")"); done
    echo "$scenario: ${values[*]}"
    numeric=$(printf '%s\n' "${values[@]}" | grep -E '^[0-9]+$' | sort -n || true)
    count=$(printf '%s' "$numeric" | grep -c . || true)
    median=NA
    [ "$count" -gt 0 ] && median=$(printf '%s\n' "$numeric" | sed -n "$(((count + 1) / 2))p")
    echo "$scenario median: $median ms ($count/$RUNS valid)"
    result+="$sep\"$scenario\":{\"median\":\"$median\",\"runs\":[$(IFS=,; echo "${values[*]}" | sed 's/NA/null/g')]}"
    sep=","
done
result+="}"
[ -n "$OUT" ] && echo "$result" > "$OUT"
exit 0
