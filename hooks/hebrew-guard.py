#!/usr/bin/env python3
# claude-hebrew: a global Stop hook. Checks only the final reply of the turn (never the working notes between
# tool calls). A reply whose letters are 50% or more Latin (code fences, inline code and links not counted) is
# sent back once to be written again in Hebrew. A reply that is mostly Hebrew passes, even when a line opens
# with a Latin word: the rtl-text plugin draws such a line right-to-left.
# This is the safety net behind the hebrew-final plugin, which translates such a reply before it is shown; with
# both installed this hook almost never fires. Every decision is logged next to this file (hebrew-guard.log).
import json, sys, re, os, time
HEB = re.compile(r'[֐-׿]')
LAT = re.compile(r'[A-Za-z]')
STRIP = re.compile(r'`[^`]*`|https?://\S+|www\.\S+')
FULL_REWRITE_SHARE = 0.5
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hebrew-guard.log')

def turn_texts(path):
    rows = [json.loads(l) for l in open(path, encoding='utf-8') if l.strip()]
    texts = []
    for r in reversed(rows):
        m = r.get('message') or {}
        if r.get('type') == 'user':
            c = m.get('content')
            if isinstance(c, str) or (isinstance(c, list) and any(b.get('type') == 'text' for b in c if isinstance(b, dict))):
                break
        if r.get('type') == 'assistant':
            for b in m.get('content') or []:
                if isinstance(b, dict) and b.get('type') == 'text': texts.insert(0, b['text'])
    return texts

def prose_lines(text):
    out, fence = [], False
    for line in text.splitlines():
        s = line.strip()
        if s.startswith('```'): fence = not fence; continue
        if fence or not s: continue
        out.append(s)
    return out

def analyze(text):
    lines = prose_lines(text)
    prose = STRIP.sub(' ', '\n'.join(lines))
    heb, lat = len(HEB.findall(prose)), len(LAT.findall(prose))
    share = lat / (heb + lat) if heb + lat else 0.0
    return len(lines), heb, lat, share

def log(d, line):
    try:
        with open(LOG, 'a', encoding='utf-8') as f:
            f.write(time.strftime('%Y-%m-%d %H:%M:%S ') + str(d.get('session_id', ''))[:8] + ' ' + line + '\n')
    except Exception:
        pass

def main():
    d = json.load(sys.stdin)
    if d.get('stop_hook_active'): sys.exit(0)  # one retry only, no loop
    texts = turn_texts(d['transcript_path'])
    if not texts: sys.exit(0)
    n, heb, lat, share = analyze(texts[-1])
    verdict = 'rewrite' if share >= FULL_REWRITE_SHARE else 'pass'
    log(d, f'{verdict} lines={n} heb={heb} lat={lat} share={share:.2f}')
    if verdict == 'rewrite':
        sys.stderr.write('התשובה למשתמש כתובה באנגלית (' + str(round(share * 100)) + '% אותיות לטיניות). לכתוב אותה מחדש בעברית בלבד, '
                         'כל שורה נפתחת במילה עברית או בספרה, בלי להתנצל ובלי להזכיר את הבדיקה הזאת.')
        sys.exit(2)

if __name__ == '__main__':
    main()
