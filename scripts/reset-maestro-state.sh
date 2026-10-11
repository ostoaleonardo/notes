#!/usr/bin/env bash
set -e

PACKAGE=com.monospace.notes
DB=databases/RKStorage
KEYS="'startup-behavior','current-note','collapsed-folders'"
STARTUP_HOME=home
TMP=$(mktemp)

adb shell am force-stop "$PACKAGE"
adb exec-out run-as "$PACKAGE" cat "$DB" > "$TMP"
python3 - "$TMP" "$KEYS" "$STARTUP_HOME" <<'PY'
import sqlite3, sys
db = sqlite3.connect(sys.argv[1])
db.execute(f"delete from catalystLocalStorage where key in ({sys.argv[2]})")
db.execute(
    "insert into catalystLocalStorage (key, value) values ('startup-behavior', ?)",
    (sys.argv[3],)
)
db.commit()
PY
adb push "$TMP" /data/local/tmp/RKStorage > /dev/null
adb shell "run-as $PACKAGE sh -c 'cat /data/local/tmp/RKStorage > $DB; rm -f $DB-journal'"
adb shell rm /data/local/tmp/RKStorage
rm -f "$TMP"
