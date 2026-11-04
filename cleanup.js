// Bol cleanup engine: pure rules, ~0 memory, no model on the device.
(function (root) {
  const FILLERS = [
    /\b(um+|uh+|erm+|hmm+|mm+|ah+)\b/gi,
    /\byou know\b/gi,
    /\bi mean\b(?!\s+no\b)/gi,
    /\bbasically\b/gi,
    /\bmatlab\b/gi,
    /\bactually\b(?=,?\s+(i|the|a|it|we|this|that)\b)/gi,
    /\blike\b(?=,?\s+(i|you|we|it|the|a|so|just)\b)/gi,
    /(^|\s)(?:उम+|अं+|हम्म+|मतलब|यानी कि|यानी|वो क्या है)(?=[\s,.।]|$)/g,
    /\b(?:okay so|so so)\b/gi,
  ];
  const PUNCT = [
    [/\b(full stop|period)\b/gi, '.'],
    [/\bcomma\b/gi, ','],
    [/\bquestion mark\b/gi, '?'],
    [/\bexclamation (mark|point)\b/gi, '!'],
    [/\bsemicolon\b/gi, ';'],
    [/\bcolon\b/gi, ':'],
    [/\bopen bracket\b/gi, ' ('],
    [/\bclose bracket\b/gi, ') '],
    [/\bnew paragraph\b/gi, '\n\n'],
    [/\bnew line\b/gi, '\n'],
    [/\bपूर्ण विराम\b/g, '।'],
  ];
  const PROPER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday','january','february','march','april','june','july','august','september','october','november','december','india','hindi','english'];
  function selfCorrect(t) {
    const MARK = /\s*\b(?:oh no|sorry|no wait|wait no|i mean no|nahi nahi)\b,?\s*/i;
    let m, guard = 0;
    while ((m = MARK.exec(t)) && guard++ < 10) {
      const before = t.slice(0, m.index);
      const after = t.slice(m.index + m[0].length);
      const rep = (after.match(/^[^,.;:!?\n]*/) || [''])[0].trim();
      const n = Math.max(1, Math.min(4, rep ? rep.split(/\s+/).length : 1));
      const words = before.trimEnd().split(/\s+/);
      let drop = 0;
      while (drop < n && words.length > 1 && !/[.!?]$/.test(words[words.length - 1] || '')) { words.pop(); drop++; }
      t = words.join(' ') + ' ' + after;
    }
    return t;
  }
  function spokenList(t) {
    const ORD = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth'];
    const re = new RegExp('\\b(' + ORD.join('|') + ')(?:ly| point)?[,:]?\\s+', 'gi');
    const hits = [...t.matchAll(re)];
    if (hits.length < 2) return t;
    let out = t.slice(0, hits[0].index).trim();
    if (out && !/[.!?:]$/.test(out)) out += ':';
    hits.forEach((h, i) => {
      const start = h.index + h[0].length;
      const end = i + 1 < hits.length ? hits[i + 1].index : t.length;
      let item = t.slice(start, end).trim().replace(/[,]\s*$/, '').replace(/\.\s*$/, '');
      item = item.charAt(0).toUpperCase() + item.slice(1);
      out += `\n${i + 1}. ${item}`;
    });
    return out;
  }
  const dedupe = (t) => t.replace(/\b(\w+)(\s+\1\b)+/gi, '$1');
  function tidy(t) {
    t = t.replace(/[ \t]+([,.!?;:।])/g, '$1')
         .replace(/([,!?;:])(?=[^\s\d"')])/g, '$1 ')
         .replace(/\.(?=[A-Za-z]{2})/g, '. ')
         .replace(/([,.!?;:])\1+/g, '$1')
         .replace(/[ \t]{2,}/g, ' ')
         .replace(/ *\n */g, '\n')
         .trim()
         .replace(/\bi\b/g, 'I')
         .replace(/\bi'(m|ve|ll|d)\b/gi, "I'$1");
    for (const w of PROPER) t = t.replace(new RegExp('\\b' + w + '\\b', 'g'), w[0].toUpperCase() + w.slice(1));
    t = t.replace(/(^|[.!?]\s+|\n)([a-z])/g, (s, p, c) => p + c.toUpperCase());
    return t;
  }
  function clean(raw, opts = {}) {
    if (!raw) return '';
    let t = String(raw).replace(/\s+/g, ' ').trim();
    for (const f of FILLERS) t = t.replace(f, ' ');
    t = t.replace(/\s+/g, ' ');
    for (const [re, rep] of PUNCT) t = t.replace(re, rep);
    if (opts.corrections !== false) t = selfCorrect(t);
    t = dedupe(t);
    t = spokenList(t);
    return tidy(t);
  }
  function command(text) {
    const t = String(text).trim().toLowerCase().replace(/[.!]+$/, '');
    if (/^(delete|remove) (the )?(last|that) sentence$/.test(t) || /^scratch that$/.test(t)) return 'delete_sentence';
    if (/^clear (all|everything)$/.test(t)) return 'clear';
    if (/^undo$/.test(t)) return 'undo';
    if (/^copy( that| it| all)?$/.test(t)) return 'copy';
    if (/^(send|share) (it|that)( on whatsapp)?$/.test(t)) return 'share';
    if (/^stop( listening)?$/.test(t)) return 'stop';
    return null;
  }
  const api = { clean, command };
  if (typeof module !== 'undefined') module.exports = api; if (typeof globalThis !== 'undefined') globalThis.BolClean = api; else root.BolClean = api;
})(typeof window !== 'undefined' ? window : globalThis);
