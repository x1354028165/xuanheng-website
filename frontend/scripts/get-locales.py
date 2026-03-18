#!/usr/bin/env python3
import sqlite3, json, sys

db = sys.argv[1] if len(sys.argv) > 1 else '/home/ec2-user/xuanheng-website/cms/.tmp/data.db'
try:
    conn = sqlite3.connect(db)
    rows = conn.execute("SELECT code, name FROM i18n_locale WHERE code != 'en' ORDER BY id").fetchall()
    result = [{'code': r[0], 'name': r[1], 'isDefault': r[0] == 'zh-CN'} for r in rows]
    conn.close()
    print(json.dumps(result))
except Exception as e:
    print('[]', file=sys.stderr)
    sys.exit(1)
