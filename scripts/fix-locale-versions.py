#!/usr/bin/env python3
"""修复 Strapi v5 locale 版本注册 — 通过 content-manager REST API 重新写入翻译"""
import sqlite3, json, urllib.request, time

STRAPI_URL = 'http://localhost:1337'
DB_PATH = '/home/ec2-user/xuanheng-website/cms/.tmp/data.db'
TARGET_LOCALES = ['en-US','de','fr','es','pt','ru','zh-TW']

CONTENT_TYPES = [
    ('products', 'api::product.product', ['title','slug','tagline','description','category','features','key_specs','sort_order']),
    ('solutions', 'api::solution.solution', ['title','slug','tagline','description','features']),
    ('articles', 'api::article.article', ['title','slug','summary','body']),
]

def get_admin_token():
    data = json.dumps({'email':'admin@gmail.com','password':'Admin1234!'}).encode()
    req = urllib.request.Request(f'{STRAPI_URL}/admin/login', data=data, headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read()).get('data',{}).get('token','')

def api_put(path, token, payload):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f'{STRAPI_URL}{path}', data=data, method='PUT',
        headers={'Content-Type':'application/json','Authorization':f'Bearer {token}'})
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:100]

def api_post(path, token):
    req = urllib.request.Request(f'{STRAPI_URL}{path}', data=b'{}', method='POST',
        headers={'Content-Type':'application/json','Authorization':f'Bearer {token}'})
    try:
        with urllib.request.urlopen(req) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code

token = get_admin_token()
print(f'Token: {token[:20]}...')

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

total_ok = 0
total_fail = 0

for table, uid, fields in CONTENT_TYPES:
    print(f'\n=== {table} ===')
    zh_docs = conn.execute(f"SELECT document_id FROM {table} WHERE locale='zh-CN'").fetchall()
    
    for doc_row in zh_docs:
        doc_id = doc_row['document_id']
        
        for locale in TARGET_LOCALES:
            row = conn.execute(f"SELECT * FROM {table} WHERE document_id=? AND locale=?", (doc_id, locale)).fetchone()
            if not row or not row['title']:
                continue
            
            payload = {}
            for field in fields:
                val = row[field] if field in row.keys() else None
                if val is None:
                    continue
                if isinstance(val, str) and val and val[0] in '[{':
                    try: val = json.loads(val)
                    except: pass
                payload[field] = val
            
            if not payload.get('title'):
                continue
            
            # PUT via content-manager
            path = f'/content-manager/collection-types/{uid}/{doc_id}?locale={locale}'
            status, result = api_put(path, token, payload)
            
            if status == 200:
                # Publish
                pub_status = api_post(f'/content-manager/collection-types/{uid}/{doc_id}/actions/publish?locale={locale}', token)
                mark = '✅' if pub_status == 200 else f'⚠️pub{pub_status}'
                print(f'  {mark} {locale}: {str(row["title"])[:25]}')
                total_ok += 1
            else:
                print(f'  ❌ {locale}: {status} {str(result)[:50]}')
                total_fail += 1
            
            time.sleep(0.1)

conn.close()
print(f'\n=== 完成: {total_ok} 成功, {total_fail} 失败 ===')
