# Bol · बोल — speak messy, get clean text

A free, open take on voice dictation apps like Infina. Talk the way you talk (fillers, repeats, "oh no, I mean..."), get clean text.

Live: https://bol.akshay-ira.workers.dev

## Why it is light
- Speech to text: the browser's own speech engine (Chrome on Android/desktop). Nothing downloaded, 0 MB on the phone.
- Instant cleanup: a 4 KB rules engine that runs on the phone (fillers in English and Hindi, repeated words, "scratch that", spoken punctuation, "first... second..." lists, self-corrections).
- AI polish (optional): server side on Cloudflare Workers AI, smallest model first (Llama 3.2 1B, then 3B, then 3.1 8B). Every answer is checked (no refusals, no dropped facts, Hindi stays Hindi). If a check fails, the next model tries, and the rules text is kept if all fail.

## Modes
Plain text, Message (WhatsApp share), Mains answer (7-minute timer, word count), Notes (numbered points).
Languages: English (India), Hindi, Marathi, Kannada.

## Voice commands
"scratch that", "new paragraph", "new line", "full stop", "comma", "question mark", "copy that", "send it", "undo", "clear all", "stop".

## Run it yourself
```
npm i && npx wrangler deploy
node test.js
```
Free tier is enough: Workers 100K requests a day, Workers AI free daily neurons.

MIT licence.
