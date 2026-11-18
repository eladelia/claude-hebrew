# עברית בקלוד קוד: תשובות בעברית, פעם אחת, מיושרות לימין

חבילה קטנה למי שעובד עם Claude Code ורוצה שהתשובות אליו יהיו בעברית, בלי שהמודל יגלוש לאנגלית ובלי שפסקאות ייושרו לשמאל. היא לא נוגעת בעבודה עצמה: קוד, פקודות, הערות ביניים בין כלים ומה שהמודל עושה מאחורי הקלעים נשארים באנגלית כרגיל. רק מה שאתם קוראים הופך לעברית.

## מה בפנים

1. `rules/CLAUDE.md`: קטע כללים שמצרפים לקובץ הכללים הגלובלי. זה מה שמונע אנגלית מראש, וברוב המוחלט של המקרים זה מספיק.
2. `plugins/hebrew-final`: תוסף שמחזיק את התשובה הסופית עד שהיא שלמה, ואם רובה אנגלית (50% ומעלה מהאותיות) מתרגם אותה לעברית בקריאת מודל קטנה אחת לפני שהיא מוצגת. אתם רואים תשובה אחת, בעברית, והמודל לא חוזר על העבודה.
3. `plugins/rtl-text`: תוסף תצוגה שמיישר לימין שורה שנפתחת במונח באנגלית (שם שרת, פקודה, מזהה) ויש בה עברית. האפליקציה מיישרת פסקה לפי האות הראשונה שלה, והתוסף מוסיף סימן כיוון בלתי נראה בציור בלבד. שורה שכולה אנגלית נשארת מיושרת לשמאל, כמו שאנגלית נקראת.
4. `hooks/hebrew-guard.py` עם `hooks/settings-snippet.json`: שומר שרץ בסיום כל תשובה. אם בכל זאת יצאה תשובה שרובה אנגלית, הוא מבקש מהמודל פעם אחת לכתוב אותה מחדש בעברית. עם שני התוספים הוא כמעט לא מופעל.

## התקנה

הכל רץ במחשב שלכם, בלי שרת ובלי חשבון נוסף. נדרש Claude Code בגרסה שתומכת בתוספים (סוף 2026 ואילך).

1. הורידו את הריפו למחשב, למשל ל-`~/claude-hebrew`. הוא נחוץ לכללים ולשומר; את התוספים Claude Code מוריד בעצמו מגיטהאב.

```bash
git clone https://github.com/eladelia/claude-hebrew.git ~/claude-hebrew
```

בלי git אפשר להוריד ZIP מהכפתור Code בדף הריפו ולפתוח אותו לאותה תיקייה.

2. הכללים: הוסיפו את התוכן של `rules/CLAUDE.md` לסוף הקובץ `~/.claude/CLAUDE.md`. אם אין קובץ כזה, העתיקו אותו לשם כמו שהוא.

3. התוספים, מהטרמינל, מתוך כל תיקייה:

```bash
claude plugin marketplace add eladelia/claude-hebrew
```

```bash
claude plugin install hebrew-final@claude-hebrew --scope user
```

```bash
claude plugin install rtl-text@claude-hebrew --scope user
```

באפליקציית Claude לשולחן העבודה אפשר במקום זה ללחוץ על הפלוס ליד תיבת ההודעה, לבחור Plugins, להוסיף marketplace מהכתובת `eladelia/claude-hebrew` ואז להוסיף את שני התוספים.

4. השומר: העתיקו את `hooks/hebrew-guard.py` ל-`~/.claude/hooks/hebrew-guard.py`, ומזגו את התוכן של `hooks/settings-snippet.json` לתוך `~/.claude/settings.json` (אם כבר יש שם מפתח `hooks`, הוסיפו את הערך של `Stop` לתוכו). בווינדוס החליפו בפקודה `python3` ב-`python` ואת `$HOME` בנתיב המלא של תיקיית המשתמש.

5. פתחו סשן חדש, או הקלידו `/reload-plugins` בסשן פתוח. הכללים נקראים רק בפתיחת סשן.

## בדיקה שזה עובד

בקשו מקלוד במפורש: "כתוב לי פסקה באנגלית על מזג האוויר". אם הכל מותקן, תראו פסקה אחת בעברית, בלי אנגלית לפניה. בקשו גם: "פתח שורה במילה SERVER01 ואחריה משפט בעברית", ותראו שהשורה מיושרת לימין.

## מה חשוב לדעת

התשובה הסופית מופיעה בבת אחת כשהיא מוכנה, ולא זורמת מילה אחר מילה. זה המחיר של הבדיקה לפני ההצגה.

תשובה שתורגמה נשמרת בשיחה מתורגמת, כלומר גם ההמשך יהיה בעברית. התרגום נעשה במודל קטן (Sonnet) עם הטקסט בלבד, בלי ההיסטוריה של השיחה, ולכן הוא זול. אפשר לשנות את המודל, את הסף (50%) ואת ההנחיה לתרגום בראש הקובץ `plugins/hebrew-final/hooks/register.ts`.

הערות ביניים באנגלית בין קריאות לכלים לא נוגעים בהן בכוונה: הן חוסכות טוקנים, ואתם לא אמורים לקרוא אותן.

הסרה: `claude plugin uninstall hebrew-final@claude-hebrew --scope user` ואותו דבר ל-`rtl-text`, מחיקת ההוק מ-`settings.json`, ומחיקת הקטע מ-`CLAUDE.md`.

## רישיון

חופשי לשימוש ולשינוי, ברישיון MIT (הקובץ `LICENSE`). נבנה על ידי אלעד אליה, נובמבר 2026.

## English

**claude-hebrew** makes Claude Code answer Hebrew speakers in Hebrew, once, and right-aligned. The work itself (code, commands, tool calls, working notes) stays in English; only the final reply you read is in Hebrew.

It has four parts: a rules snippet for `~/.claude/CLAUDE.md` that prevents English replies up front; the `hebrew-final` plugin, which translates a final reply that is still mostly English (50% or more Latin letters) with one small model call before it is shown; the `rtl-text` plugin, which draws lines that open with a Latin word but hold Hebrew right-to-left (all-English lines stay left-to-right); and an optional Stop hook (`hooks/hebrew-guard.py`) as a last safety net. Everything runs locally and needs a Claude Code version with plugin support.

Install the plugins:

```bash
claude plugin marketplace add eladelia/claude-hebrew
claude plugin install hebrew-final@claude-hebrew --scope user
claude plugin install rtl-text@claude-hebrew --scope user
```

For the rules and the hook, clone the repository (`git clone https://github.com/eladelia/claude-hebrew.git ~/claude-hebrew`), append `rules/CLAUDE.md` to `~/.claude/CLAUDE.md`, copy `hooks/hebrew-guard.py` to `~/.claude/hooks/`, and merge `hooks/settings-snippet.json` into `~/.claude/settings.json`. Then start a new session. See `CONTRIBUTING.md` to work on the project. MIT licensed.
