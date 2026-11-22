// worker.js - منشئ الأسئلة (النموذج الأول)
// النشر: ارفع هذا الملف مع wrangler.toml على Cloudflare Workers.
// ملاحظة: لا تستخدم علامة (backtick) ولا ${ داخل نص الصفحة لأنه مكتوب داخل String.raw

const HTML = String.raw`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>منشئ الأسئلة</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--blue:#1f6feb;--green:#16a34a;--red:#dc2626;--amber:#d97706;--ink:#0f2038;--bg:#e9eef5;--line:#d3dce8}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:'Cairo','Segoe UI',Tahoma,Arial,sans-serif;background:var(--bg);color:var(--ink);direction:rtl;-webkit-text-size-adjust:100%}
button,input,textarea{font-family:inherit}
button{cursor:pointer}

/* ===== واجهة الموقع ===== */
.topbar{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid var(--line);padding:8px 14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.brand{font-weight:800;font-size:18px;color:var(--blue)}
.tabs{display:flex;gap:6px;flex-wrap:wrap}
.tab{border:1px solid var(--line);background:#f5f8fc;color:#4b5d78;border-radius:10px;padding:6px 14px;font-weight:700;font-size:14px}
.tab.active{background:var(--blue);border-color:var(--blue);color:#fff}
.tab:disabled{opacity:.55;cursor:not-allowed}
.tab small{font-size:11px;font-weight:600;margin-inline-start:5px}
.toolbar{background:#fff;border-bottom:1px solid var(--line);padding:8px 14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.btn{border:0;border-radius:10px;padding:8px 14px;font-weight:700;font-size:14px;color:#fff;background:var(--blue)}
.btn.green{background:var(--green)}
.btn.red{background:var(--red)}
.btn.amber{background:var(--amber)}
.btn.gray{background:#64748b}
.btn.sm{padding:6px 11px}
.btn:hover{filter:brightness(1.08)}
.btn:disabled{opacity:.5;cursor:not-allowed;filter:none}
.zoom{display:flex;align-items:center;gap:6px;font-weight:700;font-size:13px}
.status{margin-inline-start:auto;font-size:13px;color:#51627a;font-weight:600}
.status.warn{color:#c2410c;font-weight:800}
.stage{padding:18px 8px 70px;overflow-x:auto}
.wrap{position:relative;margin:0 auto}

/* ===== ورقة A4 ===== */
.page{position:absolute;top:0;right:0;width:210mm;height:296mm;background:#fff;color:#000;box-shadow:0 6px 28px rgba(15,30,60,.22);padding:9mm 11mm;display:flex;flex-direction:column;direction:rtl;font-size:var(--fs,17px);line-height:1.5;transform-origin:top right;overflow:hidden}
.page.over{box-shadow:0 0 0 3px #e11d48,0 6px 28px rgba(15,30,60,.22)}
.page:not(.exporting) .ed{cursor:pointer;border-radius:4px}
.page:not(.exporting) .ed:hover{background:rgba(31,111,235,.10);outline:1px dashed rgba(31,111,235,.6)}

.top{display:flex;gap:5mm;align-items:flex-start;flex:none}
.ftable{flex:1;min-width:0;display:flex;border:1.4px solid #222;min-height:2em}
.ftable.none{border:0}
.field{display:flex;flex-direction:column;min-width:0;border-left:1.4px solid #222}
.field:last-child{border-left:0}
.fh{background:#e7cfa4;text-align:center;font-weight:800;padding:.1em .4em;border-bottom:1.4px solid #222;line-height:1.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fb{height:var(--fh,11mm)}
.fempty{padding:.5em;color:#8a98ad;font-size:.8em;text-align:center;width:100%}

.final{flex:none;width:27mm;height:27mm;border:2px solid #000;border-radius:50%!important;position:relative;overflow:hidden}
.fln{position:absolute;left:12%;right:12%;top:50%;border-top:2px solid #000}
.fnum{position:absolute;left:0;right:0;top:50%;bottom:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.45em}

.title{flex:none;text-align:center;font-weight:800;font-size:1.3em;margin:.45em 0 .35em;padding:.05em .5em;line-height:1.4}
.title .ln{line-height:1.4}
.title.blank::after{content:"اضغط هنا لكتابة اسم النموذج";color:#8a98ad;font-size:.7em;font-weight:600}

.qs{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.q{flex:1 0 auto;display:flex;flex-direction:column}
.q + .q{margin-top:.4em}
.qh{display:flex;gap:.7em;align-items:flex-start;font-weight:700;margin-bottom:.1em}
.qlab{white-space:nowrap;flex:none;min-width:3.2em;font-weight:800;line-height:1.55}
.qhead{flex:1;min-width:0;font-weight:600}
.qrows{flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-evenly}
.row{display:flex;gap:.7em;align-items:flex-start;padding:.1em 0}
.rtext{flex:1;min-width:0;min-height:1.6em}

.sbox{flex:none;width:3.2em;height:2.9em;border:1.6px solid #000;position:relative;background:#fff;margin-top:.1em}
.sl{position:absolute;left:14%;right:14%;top:44%;border-top:1.6px solid #000}
.sn{position:absolute;left:0;right:0;top:46%;bottom:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.95em;line-height:1}
.sbox.empty{border:1.5px dashed #8fa6c8;background:#f3f8ff}
.sbox.empty .sl{border-top:1.5px dashed #8fa6c8}
.sbox.empty .sn{color:#4f74b3;font-size:.62em;font-weight:700}

.ln{min-height:1.55em;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
.ln.c{text-align:center}
.ln.fl{display:flex;align-items:baseline;gap:.3em;white-space:normal}
.ln.fl.c{justify-content:center}
.seg{white-space:normal}
.dots{display:inline-block;flex:none;height:1em;border-bottom:1.7px dotted #000;position:relative;top:-.12em}
.dots.fill{flex:1 1 0;min-width:1.5em}
.grid{display:grid;grid-template-columns:repeat(var(--n,2),minmax(0,1fr));column-gap:.9em;row-gap:.1em;margin:.05em 0}
.gc{display:flex;align-items:baseline;gap:.3em;min-width:0;min-height:1.55em;line-height:1.55}
.gc.hd{justify-content:center;text-align:center;font-weight:700}
.gc.c{justify-content:center;text-align:center}

/* ===== القوائم والنوافذ ===== */
.menu{position:fixed;z-index:150;background:#fff;border:1px solid var(--line);border-radius:12px;box-shadow:0 12px 34px rgba(10,25,50,.25);padding:6px;display:flex;flex-direction:column;min-width:200px;direction:rtl}
.mi{border:0;background:transparent;text-align:right;padding:9px 12px;border-radius:8px;font-size:14px;font-weight:700;color:#1b2b44}
.mi:hover{background:#eef4ff}
.mi.danger{color:#c0362d}
.ov{position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(10,20,40,.45);display:flex;align-items:center;justify-content:center;z-index:200;padding:12px}
.modal{background:#fff;border-radius:16px;width:min(580px,100%);max-height:92vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);direction:rtl}
.mh{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);font-weight:800;font-size:16px}
.xbtn{border:0;background:#eef2f8;border-radius:8px;width:30px;height:30px;font-size:20px;line-height:1;color:#51627a}
.mb{padding:14px 18px;display:flex;flex-direction:column;gap:12px}
.mf{display:flex;gap:8px;justify-content:flex-start;padding:12px 18px;border-top:1px solid var(--line);flex-wrap:wrap}
.f{display:flex;flex-direction:column;gap:5px}
.f > span{font-weight:700;font-size:13px;color:#33445f}
.in,.ta{border:1px solid var(--line);border-radius:10px;padding:9px 11px;font-size:15px;direction:rtl;width:100%;background:#fff;color:var(--ink)}
.ta{min-height:110px;resize:vertical;line-height:1.8}
.in:focus,.ta:focus{outline:2px solid rgba(31,111,235,.35);border-color:var(--blue)}
.tools{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
.chip{border:1px solid var(--line);background:#f3f6fb;border-radius:999px;padding:4px 12px;font-size:12.5px;font-weight:700;color:#33445f}
.chip:hover{background:#e4edfb}
.hint{font-size:12px;color:#5b6b82;line-height:1.8;background:#f6f9fd;border-radius:10px;padding:8px 10px;margin-top:6px}
.rng{width:100%}
.rv{display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:13px;color:#33445f}
.toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%) translateY(40px);background:#14233d;color:#fff;padding:10px 18px;border-radius:12px;font-weight:700;font-size:14px;opacity:0;pointer-events:none;transition:all .25s;z-index:300;max-width:92vw;text-align:center}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

/* ===== الطباعة ===== */
@page{size:A4;margin:0}
@media print{
  html,body{background:#fff!important}
  .topbar,.toolbar,.toast,.menu,.ov{display:none!important}
  .stage{padding:0!important;overflow:visible!important}
  .wrap{width:auto!important;height:auto!important;margin:0!important}
  .page{position:static!important;transform:none!important;box-shadow:none!important;margin:0!important;page-break-after:avoid;break-after:avoid}
  .sbox.empty,.fempty{visibility:hidden}
  .title.blank::after{display:none}
  .page .ed:hover{background:none!important;outline:none!important}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
.page.exporting .sbox.empty,.page.exporting .fempty{visibility:hidden}
.page.exporting .title.blank::after{display:none}
</style>
</head>
<body>

<div class="topbar">
  <div class="brand">منشئ الأسئلة</div>
  <div class="tabs">
    <button class="tab active" type="button">النموذج الأول</button>
    <button class="tab" type="button" disabled>النموذج الثاني<small>قريبًا</small></button>
    <button class="tab" type="button" disabled>النموذج الثالث<small>قريبًا</small></button>
    <button class="tab" type="button" disabled>النموذج الرابع<small>قريبًا</small></button>
  </div>
</div>

<div class="toolbar">
  <button class="btn" id="bAddQ" type="button">+ إضافة سؤال</button>
  <button class="btn amber" id="bAddF" type="button">+ إضافة خانة</button>
  <button class="btn green" id="bPdf" type="button">حفظ PDF</button>
  <button class="btn gray" id="bPrint" type="button">طباعة</button>
  <button class="btn gray" id="bUndo" type="button">تراجع</button>
  <button class="btn red" id="bReset" type="button">استرجاع النموذج الأصلي</button>
  <span class="zoom">
    <button class="btn gray sm" id="bZm" type="button">-</button>
    <span id="zl">100%</span>
    <button class="btn gray sm" id="bZp" type="button">+</button>
  </span>
  <span class="status" id="status"></span>
</div>

<div class="stage" id="stage">
  <div class="wrap" id="wrap">
    <div class="page" id="page">
      <div class="top">
        <div class="ftable" id="ftable"></div>
        <div class="final ed" id="final"></div>
      </div>
      <div class="title ed" id="title"></div>
      <div class="qs" id="qs"></div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
(function () {
  'use strict';

  var STORE = 'exam-builder:t1:v1';
  var MAXFS = 18, MINFS = 9.5, FILL_AT = 60;
  var H2C = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  var JSPDF = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  var AR = '٠١٢٣٤٥٦٧٨٩';
  var DOT_RE = /([.\u2026\u00b7]{3,})/;
  var S, hist = [], zf = 1, menuEl = null, libs = {};

  /* ---------- أدوات صغيرة ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function D(n) { return new Array(n + 1).join('.'); }
  function toAr(s) { return String(s).replace(/[0-9]/g, function (d) { return AR.charAt(+d); }); }
  function toEn(s) {
    return String(s)
      .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); })
      .replace(/[\u06f0-\u06f9]/g, function (d) { return String(d.charCodeAt(0) - 0x06f0); });
  }
  function num(v) {
    var n = parseFloat(toEn(String(v == null ? '' : v)).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? 0 : n;
  }
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  /* ---------- البيانات الافتراضية (النموذج الأول) ---------- */
  function row(text, score) { return { id: uid(), text: text, score: score == null ? null : score }; }

  function defaults() {
    return {
      v: 1,
      title: 'امتحان شهري لمادة اللغة العربية - الثالث المتوسط',
      fields: [
        { id: uid(), label: 'اسم الطالب', w: 68 },
        { id: uid(), label: 'الشعبة', w: 32 }
      ],
      fieldH: 11,
      final: { auto: true, value: '' },
      questions: [
        {
          id: uid(), sub: 'أ',
          head: 'قال تعالى ( ولاتكتموا الشهادة ومن يكتمها فإنه آثم قلبه )',
          rows: [
            row('١- في الآية أعلاه مشتق ، عينه مبينا نوعه موضحا سبب عمله ، ثم اعرب معموله :\nالمشتق | نوعه | سبب عمله | اعراب معموله\n' + [D(10), D(10), D(10), D(10)].join(' | '), '٦'),
            row('٢- صغ من الفعل ( يكتم ) اسم فاعل مبينا السبب\nيكتم ' + D(45), '٤'),
            row('ب ) إذكر مصادر الأفعال الأتية مع بيان اوزانها والسبب :\n^رواغ ، تجاهل ، قلد\n | المصادر | اوزانها | السبب\nراوغ ← | ' + D(10) + ' | ' + D(10) + ' | ' + D(10) + '\nتسامح ← | ' + D(10) + ' | ' + D(10) + ' | ' + D(10) + '\nأعان ← | ' + D(10) + ' | ' + D(10) + ' | ' + D(10), '٩')
          ]
        },
        {
          id: uid(), sub: 'أ',
          head: 'رد المصادر الاتية إلى أفعالها :',
          rows: [
            row('تزكية ' + D(40) + ' | ، تألقا ' + D(40) + '\nمكابرة ' + D(40) + ' | ، أشار ' + D(40), '٤'),
            row('ب ) أنت كاتبُ الواجبِ\nأنت كاتبٌ الواجبَ\nفي أي من الجملتين أعلاه عمل اسم الفاعل ؟ ولماذا ؟\nج : ' + D(80), '٤')
          ]
        },
        {
          id: uid(), sub: '',
          head: 'الإمــلاء/ ما سبب كتابة الهمزة في الكلمات الاتية :',
          rows: [
            row(' | السبب | | السبب\nأصالة | ' + D(10) + ' | أستقرَّ | ' + D(10) + '\nأفهمُ | ' + D(10) + ' | أخذا | ' + D(10) + '\nأسلمُ | ' + D(10) + ' | | ', '١٠')
          ]
        },
        {
          id: uid(), sub: 'أ',
          head: '١- ماذا تجسد قصيدة خصائص شعر الجواهري ؟',
          rows: [
            row('٢- عم تعبر قصيدة الشاعر الصافي النجفي ؟', '١٠'),
            row('ب ) ما المدلول اللغوي للكلمات الاتية : ابتدر ، الكوة ، حاق', '٦')
          ]
        }
      ]
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && o.questions && o.fields) return o;
      }
    } catch (e) {}
    return defaults();
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {} }

  /* ---------- السجل (تراجع) ---------- */
  function updateUndo() { $('#bUndo').disabled = !hist.length; }
  function pushHist(snap) { hist.push(snap || JSON.stringify(S)); if (hist.length > 60) hist.shift(); updateUndo(); }
  function mutate(fn) { pushHist(); fn(); renderAll(); save(); }
  function undo() {
    if (!hist.length) return;
    S = JSON.parse(hist.pop());
    renderAll(); save(); updateUndo();
  }

  /* ---------- الدرجات ---------- */
  function hasScore(r) { return r.score != null && r.score !== ''; }
  function sumScores() {
    var t = 0;
    S.questions.forEach(function (q) { q.rows.forEach(function (r) { if (hasScore(r)) t += num(r.score); }); });
    return t;
  }
  function finalText() {
    if (S.final.auto) { var t = sumScores(); return t ? toAr(String(Math.round(t * 100) / 100)) : ''; }
    return S.final.value || '';
  }
  function flatRows() {
    var out = [];
    S.questions.forEach(function (q) { q.rows.forEach(function (r) { out.push(r); }); });
    return out;
  }
  function moveScore(r, d) {
    var f = flatRows(), i = f.indexOf(r), j = i + d;
    if (i < 0 || j < 0 || j >= f.length) { toast('لا يمكن نقل الدرجة أكثر من ذلك'); return; }
    mutate(function () { var t = f[j].score; f[j].score = r.score; r.score = t; });
  }

  /* ---------- تحويل النص إلى عناصر الورقة ---------- */
  function hasDots(s) { return DOT_RE.test(s); }

  function segNodes(str, fillAll) {
    var parts = str.split(DOT_RE), out = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p === '') continue;
      if (i % 2 === 1) {
        var n = p.replace(/\u2026/g, '...').length;
        var d = el('span', 'dots');
        if (fillAll || n >= FILL_AT) d.classList.add('fill');
        else d.style.width = (n * 0.3) + 'em';
        out.push(d);
      } else {
        out.push(el('span', 'seg', p));
      }
    }
    return out;
  }

  function renderLine(s) {
    var center = false;
    if (s.charAt(0) === '^') { center = true; s = s.slice(1); }
    var d = el('div', 'ln' + (center ? ' c' : ''));
    if (hasDots(s)) {
      d.classList.add('fl');
      segNodes(s, false).forEach(function (n) { d.appendChild(n); });
    } else {
      d.textContent = s === '' ? '\u00a0' : s;
    }
    return d;
  }

  function renderGrid(lines) {
    var rows = lines.map(function (l) {
      var c = false;
      if (l.charAt(0) === '^') { c = true; l = l.slice(1); }
      return { cells: l.split('|').map(function (x) { return x.trim(); }), c: c };
    });
    var n = 0;
    rows.forEach(function (r) { if (r.cells.length > n) n = r.cells.length; });
    if (n > 8) n = 8;
    var g = el('div', 'grid');
    g.style.setProperty('--n', n);
    var headRow = false;
    if (rows.length > 1) {
      var first = rows[0].cells.some(function (x) { return hasDots(x); });
      var other = false;
      for (var k = 1; k < rows.length; k++) {
        if (rows[k].cells.some(function (x) { return hasDots(x); })) other = true;
      }
      headRow = !first && other;
    }
    rows.forEach(function (r, ri) {
      for (var ci = 0; ci < n; ci++) {
        var txt = r.cells[ci] || '';
        var c = el('div', 'gc' + (ri === 0 && headRow ? ' hd' : '') + (r.c ? ' c' : ''));
        segNodes(txt, true).forEach(function (nd) { c.appendChild(nd); });
        g.appendChild(c);
      }
    });
    return g;
  }

  function renderLines(text) {
    var frag = document.createDocumentFragment();
    var lines = String(text == null ? '' : text).replace(/\r/g, '').split('\n');
    var i = 0;
    while (i < lines.length) {
      if (lines[i].indexOf('|') >= 0) {
        var grp = [], j = i;
        while (j < lines.length && lines[j].indexOf('|') >= 0) { grp.push(lines[j]); j++; }
        frag.appendChild(renderGrid(grp));
        i = j;
      } else {
        frag.appendChild(renderLine(lines[i]));
        i++;
      }
    }
    return frag;
  }

  /* ---------- رسم الورقة ---------- */
  function renderTitle() {
    var t = $('#title');
    t.innerHTML = '';
    t.appendChild(renderLine('^' + (S.title || '')));
    t.classList.toggle('blank', !S.title);
  }

  function renderFields() {
    var box = $('#ftable');
    box.innerHTML = '';
    box.style.setProperty('--fh', (S.fieldH || 11) + 'mm');
    box.classList.toggle('none', !S.fields.length);
    S.fields.forEach(function (f) {
      var d = el('div', 'field ed');
      d.style.flex = (f.w || 10) + ' 1 0%';
      d.appendChild(el('div', 'fh', f.label));
      d.appendChild(el('div', 'fb'));
      d.addEventListener('click', function (e) { fieldMenu(e, f); });
      box.appendChild(d);
    });
    if (!S.fields.length) box.appendChild(el('div', 'fempty', 'لا توجد خانات - اضغط (إضافة خانة)'));
  }

  function renderFinal() {
    var f = $('#final');
    f.innerHTML = '';
    f.appendChild(el('div', 'fln'));
    f.appendChild(el('div', 'fnum', finalText()));
  }

  function renderRowEl(r) {
    var rd = el('div', 'row');
    var sb = el('div', 'sbox ed' + (hasScore(r) ? '' : ' empty'));
    sb.appendChild(el('div', 'sl'));
    sb.appendChild(el('div', 'sn', hasScore(r) ? r.score : '+ درجة'));
    sb.addEventListener('click', function (e) { scoreMenu(e, r); });
    var rt = el('div', 'rtext ed');
    rt.appendChild(renderLines(r.text));
    rt.addEventListener('click', function (e) { rowMenu(e, r); });
    rd.appendChild(sb);
    rd.appendChild(rt);
    return rd;
  }

  function renderQuestions() {
    var box = $('#qs');
    box.innerHTML = '';
    S.questions.forEach(function (q, qi) {
      var qd = el('div', 'q');
      qd.style.flexGrow = Math.max(1, q.rows.length);
      var qh = el('div', 'qh ed');
      qh.appendChild(el('div', 'qlab', 'س' + toAr(qi + 1) + (q.sub ? ' / ' + q.sub : '')));
      var hd = el('div', 'qhead');
      hd.appendChild(renderLines(q.head));
      qh.appendChild(hd);
      qh.addEventListener('click', function (e) { questionMenu(e, q, qi); });
      qd.appendChild(qh);
      var rows = el('div', 'qrows');
      q.rows.forEach(function (r) { rows.appendChild(renderRowEl(r)); });
      qd.appendChild(rows);
      box.appendChild(qd);
    });
    if (!S.questions.length) box.appendChild(el('div', 'fempty', 'لا توجد أسئلة - اضغط (إضافة سؤال)'));
  }

  function renderAll() {
    renderTitle();
    renderFields();
    renderFinal();
    renderQuestions();
    fit();
    applyZoom();
  }

  /* ---------- الملاءمة التلقائية لصفحة A4 واحدة ---------- */
  function fit() {
    var page = $('#page'), qs = $('#qs');
    var fs = MAXFS;
    page.style.setProperty('--fs', fs + 'px');
    while (fs > MINFS && qs.scrollHeight > qs.clientHeight + 1) {
      fs = Math.round((fs - 0.25) * 100) / 100;
      page.style.setProperty('--fs', fs + 'px');
    }
    var over = qs.scrollHeight > qs.clientHeight + 1;
    page.classList.toggle('over', over);
    var st = $('#status');
    st.classList.toggle('warn', over);
    st.textContent = over
      ? 'تنبيه: المحتوى أكبر من صفحة A4 حتى بأصغر خط، احذف أو قصّر بعض الأسئلة'
      : 'الصفحة A4 مرتبة تلقائيًا - حجم الخط ' + toAr(Math.round(fs * 10) / 10);
  }

  function applyZoom() {
    var stage = $('#stage'), wrap = $('#wrap'), page = $('#page');
    var pw = page.offsetWidth, ph = page.offsetHeight;
    var avail = stage.clientWidth - 16;
    var auto = Math.min(1, avail / pw);
    var s = Math.max(0.2, auto * zf);
    page.style.transform = 'scale(' + s + ')';
    wrap.style.width = (pw * s) + 'px';
    wrap.style.height = (ph * s) + 'px';
    $('#zl').textContent = toAr(Math.round(s * 100)) + '%';
  }

  /* ---------- القوائم المنبثقة ---------- */
  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } }

  function openMenu(ev, items) {
    ev.stopPropagation();
    closeMenu();
    var m = el('div', 'menu');
    items.forEach(function (it) {
      if (!it) return;
      var b = el('button', 'mi' + (it.danger ? ' danger' : ''), it.label);
      b.type = 'button';
      b.addEventListener('click', function (e) { e.stopPropagation(); closeMenu(); it.fn(); });
      m.appendChild(b);
    });
    document.body.appendChild(m);
    var w = m.offsetWidth, h = m.offsetHeight;
    var x = Math.min(Math.max(8, ev.clientX - w / 2), window.innerWidth - w - 8);
    var y = ev.clientY + 10;
    if (y + h > window.innerHeight - 8) y = Math.max(8, ev.clientY - h - 10);
    m.style.left = x + 'px';
    m.style.top = y + 'px';
    menuEl = m;
  }

  /* ---------- النوافذ ---------- */
  function modal(title, nodes, actions) {
    closeMenu();
    var api = { close: null, onClose: null };
    var ov = el('div', 'ov'), box = el('div', 'modal'), mh = el('div', 'mh'), mb = el('div', 'mb'), mf = el('div', 'mf');
    mh.appendChild(el('span', '', title));
    var x = el('button', 'xbtn', '\u00d7');
    x.type = 'button';
    mh.appendChild(x);
    nodes.forEach(function (n) { mb.appendChild(n); });
    var primary = null;
    function close() {
      ov.remove();
      document.removeEventListener('keydown', onKey, true);
      if (api.onClose) api.onClose();
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      else if (e.key === 'Enter' && primary && (e.ctrlKey || e.metaKey || (e.target && e.target.tagName === 'INPUT'))) {
        e.preventDefault();
        primary.fn(close);
      }
    }
    actions.forEach(function (a) {
      var b = el('button', 'btn ' + (a.cls || ''), a.label);
      b.type = 'button';
      b.addEventListener('click', function () { a.fn(close); });
      mf.appendChild(b);
      if (a.primary) primary = a;
    });
    api.close = close;
    x.addEventListener('click', close);
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', onKey, true);
    box.appendChild(mh); box.appendChild(mb); box.appendChild(mf);
    ov.appendChild(box);
    document.body.appendChild(ov);
    var f = box.querySelector('input,textarea');
    if (f) { f.focus(); if (f.tagName === 'INPUT') f.select(); }
    return api;
  }

  function field(text, node) {
    var d = el('div', 'f');
    d.appendChild(el('span', '', text));
    d.appendChild(node);
    return d;
  }
  function inp(value, ph) {
    var i = el('input', 'in');
    i.type = 'text';
    i.value = value || '';
    if (ph) i.placeholder = ph;
    return i;
  }
  function cancelBtn() { return { label: 'إلغاء', cls: 'gray', fn: function (close) { close(); } }; }

  function taWithTools(value, rows) {
    var wrap = el('div', 'tawrap');
    var ta = el('textarea', 'ta');
    ta.value = value || '';
    ta.rows = rows || 5;
    var bar = el('div', 'tools');
    function ins(txt) {
      var s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      ta.value = v.slice(0, s) + txt + v.slice(e);
      var p = s + txt.length;
      ta.focus();
      ta.setSelectionRange(p, p);
    }
    function toggleCenter() {
      var v = ta.value, s = ta.selectionStart;
      var ls = s > 0 ? v.lastIndexOf('\n', s - 1) + 1 : 0;
      if (v.charAt(ls) === '^') {
        ta.value = v.slice(0, ls) + v.slice(ls + 1);
        var p1 = Math.max(ls, s - 1);
        ta.setSelectionRange(p1, p1);
      } else {
        ta.value = v.slice(0, ls) + '^' + v.slice(ls);
        ta.setSelectionRange(s + 1, s + 1);
      }
    }
    function chip(label, fn) {
      var c = el('button', 'chip', label);
      c.type = 'button';
      c.addEventListener('click', function () { fn(); ta.focus(); });
      bar.appendChild(c);
    }
    chip('خط منقط', function () { ins(D(30)); });
    chip('خط طويل (يملأ السطر)', function () { ins(D(70)); });
    chip('عمود |', function () { ins(' | '); });
    chip('سهم ←', function () { ins(' \u2190 '); });
    chip('توسيط السطر', toggleCenter);
    chip('سطر فارغ', function () { ins('\n'); });
    wrap.appendChild(bar);
    wrap.appendChild(ta);
    wrap.appendChild(el('div', 'hint', 'كل سطر هنا = سطر في الورقة. النقاط المتتالية (.....) تتحول إلى خط منقط وكلما زادت النقاط طال الخط. الرمز | يقسّم السطر إلى أعمدة متساوية. الرمز ^ في أول السطر يوسّطه.'));
    return { node: wrap, ta: ta };
  }

  /* ---------- تعديل الأشياء ---------- */
  function editTitle() {
    var i = inp(S.title);
    modal('تعديل اسم النموذج', [field('اسم النموذج (يظهر في وسط الورقة)', i)], [
      { label: 'حفظ', cls: 'green', primary: true, fn: function (close) { var v = i.value.trim(); mutate(function () { S.title = v; }); close(); } },
      cancelBtn()
    ]);
  }

  function renameField(f) {
    var i = inp(f.label);
    modal('تعديل اسم النافذة', [field('اسم الخانة', i)], [
      { label: 'حفظ', cls: 'green', primary: true, fn: function (close) { var v = i.value.trim(); if (!v) { toast('اكتب اسمًا للخانة'); return; } mutate(function () { f.label = v; }); close(); } },
      cancelBtn()
    ]);
  }

  function rangeField(label, min, max, value, onInput) {
    var wrap = el('div', 'f');
    var head = el('div', 'rv');
    head.appendChild(el('span', '', label));
    var val = el('b', '', toAr(value));
    head.appendChild(val);
    var r = el('input', 'rng');
    r.type = 'range'; r.min = min; r.max = max; r.step = 1; r.value = value;
    r.addEventListener('input', function () { val.textContent = toAr(r.value); onInput(+r.value); });
    wrap.appendChild(head);
    wrap.appendChild(r);
    return wrap;
  }

  function resizeField(f) {
    var before = JSON.stringify(S);
    var w = rangeField('عرض الخانة', 10, 100, f.w || 10, function (v) { f.w = v; renderAll(); });
    var h = rangeField('ارتفاع الخانات (مم) - لكل الخانات', 6, 30, S.fieldH || 11, function (v) { S.fieldH = v; renderAll(); });
    var api = modal('تعديل حجم: ' + f.label, [w, h], [
      { label: 'تم', cls: 'green', primary: true, fn: function (close) { close(); } }
    ]);
    api.onClose = function () {
      if (JSON.stringify(S) !== before) { pushHist(before); save(); }
    };
  }

  function fieldMenu(ev, f) {
    openMenu(ev, [
      { label: 'تعديل اسم النافذة', fn: function () { renameField(f); } },
      { label: 'تعديل الحجم', fn: function () { resizeField(f); } },
      { label: 'إغلاق', danger: true, fn: function () { mutate(function () { S.fields.splice(S.fields.indexOf(f), 1); }); } }
    ]);
  }

  function addField() {
    var i = inp('', 'مثال: رقم الجلوس');
    var w = el('input', 'rng');
    w.type = 'range'; w.min = 10; w.max = 100; w.step = 1; w.value = 35;
    modal('إضافة خانة', [field('اسم الخانة', i), field('عرض الخانة', w)], [
      { label: 'إضافة', cls: 'green', primary: true, fn: function (close) {
        var v = i.value.trim();
        if (!v) { toast('اكتب اسمًا للخانة'); return; }
        mutate(function () { S.fields.push({ id: uid(), label: v, w: +w.value }); });
        close();
      } },
      cancelBtn()
    ]);
  }

  function editScore(r) {
    var i = inp(hasScore(r) ? r.score : '', 'مثال: ٦');
    i.setAttribute('inputmode', 'decimal');
    var acts = [
      { label: 'حفظ', cls: 'green', primary: true, fn: function (close) {
        var v = i.value.trim();
        mutate(function () { r.score = v === '' ? null : toAr(v); });
        close();
      } }
    ];
    if (hasScore(r)) acts.push({ label: 'حذف الدرجة', cls: 'red', fn: function (close) { mutate(function () { r.score = null; }); close(); } });
    acts.push(cancelBtn());
    modal(hasScore(r) ? 'تعديل الدرجة' : 'إضافة درجة', [field('الدرجة (تظهر تحت الخط داخل المربع)', i)], acts);
  }

  function scoreMenu(ev, r) {
    var has = hasScore(r);
    openMenu(ev, [
      { label: has ? 'تعديل الدرجة' : 'إضافة درجة', fn: function () { editScore(r); } },
      has ? { label: 'رفع الدرجة لأعلى', fn: function () { moveScore(r, -1); } } : null,
      has ? { label: 'خفض الدرجة لأسفل', fn: function () { moveScore(r, 1); } } : null,
      has ? { label: 'حذف الدرجة', danger: true, fn: function () { mutate(function () { r.score = null; }); } } : null
    ]);
  }

  function locate(r) {
    for (var qi = 0; qi < S.questions.length; qi++) {
      var ri = S.questions[qi].rows.indexOf(r);
      if (ri >= 0) return [qi, ri];
    }
    return null;
  }

  function delRow(r) {
    var p = locate(r);
    if (!p) return;
    if (!confirm('حذف هذه النقطة؟')) return;
    mutate(function () { S.questions[p[0]].rows.splice(p[1], 1); });
  }

  function moveRow(r, d) {
    var p = locate(r);
    if (!p) return;
    var qi = p[0], ri = p[1], q = S.questions[qi];
    mutate(function () {
      if (d < 0) {
        if (ri > 0) { var t = q.rows[ri]; q.rows[ri] = q.rows[ri - 1]; q.rows[ri - 1] = t; }
        else if (qi > 0) { S.questions[qi - 1].rows.push(q.rows.splice(ri, 1)[0]); }
      } else {
        if (ri < q.rows.length - 1) { var u = q.rows[ri]; q.rows[ri] = q.rows[ri + 1]; q.rows[ri + 1] = u; }
        else if (qi < S.questions.length - 1) { S.questions[qi + 1].rows.unshift(q.rows.splice(ri, 1)[0]); }
      }
    });
  }

  function editRow(r) {
    var t = taWithTools(r.text, 8);
    modal('تعديل النقطة', [t.node], [
      { label: 'حفظ', cls: 'green', primary: true, fn: function (close) { var v = t.ta.value; mutate(function () { r.text = v; }); close(); } },
      { label: 'حذف النقطة', cls: 'red', fn: function (close) { close(); delRow(r); } },
      cancelBtn()
    ]);
  }

  function rowMenu(ev, r) {
    openMenu(ev, [
      { label: 'تعديل النص', fn: function () { editRow(r); } },
      { label: 'إضافة نقطة بعدها', fn: function () {
        var p = locate(r);
        if (p) mutate(function () { S.questions[p[0]].rows.splice(p[1] + 1, 0, row('', null)); });
      } },
      { label: 'نقل النقطة لأعلى', fn: function () { moveRow(r, -1); } },
      { label: 'نقل النقطة لأسفل', fn: function () { moveRow(r, 1); } },
      { label: 'حذف النقطة', danger: true, fn: function () { delRow(r); } }
    ]);
  }

  function editHead(q) {
    var sub = inp(q.sub, 'مثال: أ');
    var t = taWithTools(q.head, 4);
    modal('تعديل السؤال', [field('الرمز بعد رقم السؤال (اختياري)', sub), field('نص السؤال', t.node)], [
      { label: 'حفظ', cls: 'green', primary: true, fn: function (close) {
        var a = sub.value.trim(), b = t.ta.value;
        mutate(function () { q.sub = a; q.head = b; });
        close();
      } },
      cancelBtn()
    ]);
  }

  function moveQ(qi, d) {
    var j = qi + d;
    if (j < 0 || j >= S.questions.length) return;
    mutate(function () { var t = S.questions[qi]; S.questions[qi] = S.questions[j]; S.questions[j] = t; });
  }

  function questionMenu(ev, q, qi) {
    openMenu(ev, [
      { label: 'تعديل نص السؤال', fn: function () { editHead(q); } },
      { label: 'إضافة نقطة', fn: function () { mutate(function () { q.rows.push(row('', null)); }); } },
      qi > 0 ? { label: 'نقل السؤال لأعلى', fn: function () { moveQ(qi, -1); } } : null,
      qi < S.questions.length - 1 ? { label: 'نقل السؤال لأسفل', fn: function () { moveQ(qi, 1); } } : null,
      { label: 'حذف السؤال', danger: true, fn: function () {
        if (confirm('حذف هذا السؤال بكل نقاطه؟')) mutate(function () { S.questions.splice(S.questions.indexOf(q), 1); });
      } }
    ]);
  }

  function addQuestion() {
    var sub = inp('', 'اختياري مثل: أ');
    var head = taWithTools('', 3);
    var first = taWithTools('', 4);
    var sc = inp('', 'اختياري - يمكن إضافتها لاحقًا');
    sc.setAttribute('inputmode', 'decimal');
    modal('إضافة سؤال جديد', [
      field('الرمز بعد رقم السؤال', sub),
      field('نص السؤال', head.node),
      field('نص النقطة الأولى (الأسطر والخطوط) - اختياري', first.node),
      field('الدرجة', sc)
    ], [
      { label: 'إضافة السؤال', cls: 'green', primary: true, fn: function (close) {
        var h = head.ta.value, f = first.ta.value, s = sc.value.trim();
        if (!h.trim() && !f.trim()) { toast('اكتب نص السؤال أولًا'); return; }
        mutate(function () {
          S.questions.push({ id: uid(), sub: sub.value.trim(), head: h, rows: [row(f, s === '' ? null : toAr(s))] });
        });
        close();
      } },
      cancelBtn()
    ]);
  }

  function editFinal() {
    var i = inp(finalText(), 'مثال: ٥٠');
    i.setAttribute('inputmode', 'decimal');
    modal('الدرجة النهائية', [
      field('الرقم الذي يظهر تحت الخط في الدائرة', i),
      el('div', 'hint', 'الافتراضي: مجموع درجات الأسئلة تلقائيًا. اكتب رقمًا آخر لتثبيته، أو اتركه فارغًا للعودة للحساب التلقائي.')
    ], [
      { label: 'حفظ', cls: 'green', primary: true, fn: function (close) {
        var v = i.value.trim();
        mutate(function () { S.final = v === '' ? { auto: true, value: '' } : { auto: false, value: toAr(v) }; });
        close();
      } },
      { label: 'حساب تلقائي', cls: 'gray', fn: function (close) { mutate(function () { S.final = { auto: true, value: '' }; }); close(); } },
      cancelBtn()
    ]);
  }

  function finalMenu(ev) {
    openMenu(ev, [
      { label: 'تعديل الدرجة النهائية', fn: editFinal },
      S.final.auto ? null : { label: 'حساب المجموع تلقائيًا', fn: function () { mutate(function () { S.final = { auto: true, value: '' }; }); } }
    ]);
  }

  /* ---------- PDF والطباعة ---------- */
  function loadScript(src) {
    if (libs[src]) return libs[src];
    libs[src] = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = res;
      s.onerror = function () { delete libs[src]; rej(new Error('load failed')); };
      document.head.appendChild(s);
    });
    return libs[src];
  }

  function fileName() {
    var t = String(S.title || 'exam')
      .replace(/[.\u2026]{2,}/g, ' ')
      .replace(/[\\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return t || 'exam';
  }

  function savePDF() {
    var btn = $('#bPdf');
    btn.disabled = true;
    btn.textContent = 'جارٍ إنشاء الملف...';
    var clone = null;
    Promise.all([loadScript(H2C), loadScript(JSPDF)])
      .then(function () { return document.fonts && document.fonts.ready; })
      .then(function () {
        clone = $('#page').cloneNode(true);
        clone.removeAttribute('id');
        clone.classList.add('exporting');
        clone.style.position = 'absolute';
        clone.style.left = '-10000px';
        clone.style.right = 'auto';
        clone.style.top = '0';
        clone.style.transform = 'none';
        clone.style.boxShadow = 'none';
        document.body.appendChild(clone);
        return window.html2canvas(clone, { scale: 3, backgroundColor: '#ffffff', useCORS: true, logging: false });
      })
      .then(function (canvas) {
        var jsPDF = window.jspdf.jsPDF;
        var pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        var h = 210 * canvas.height / canvas.width;
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, h);
        pdf.save(fileName() + '.pdf');
        toast('تم حفظ ملف PDF');
      })
      .catch(function () {
        toast('تعذر الحفظ المباشر - سيفتح الطباعة، اختر (حفظ كـ PDF)');
        setTimeout(function () { window.print(); }, 700);
      })
      .then(function () {
        if (clone && clone.parentNode) clone.remove();
        btn.disabled = false;
        btn.textContent = 'حفظ PDF';
      });
  }

  /* ---------- تشغيل ---------- */
  function init() {
    S = load();
    $('#bAddQ').addEventListener('click', addQuestion);
    $('#bAddF').addEventListener('click', addField);
    $('#bPdf').addEventListener('click', savePDF);
    $('#bPrint').addEventListener('click', function () { window.print(); });
    $('#bUndo').addEventListener('click', undo);
    $('#bReset').addEventListener('click', function () {
      if (!confirm('استرجاع النموذج الأصلي؟ ستضيع كل التعديلات الحالية.')) return;
      pushHist();
      S = defaults();
      renderAll(); save();
    });
    $('#bZm').addEventListener('click', function () { zf = Math.max(0.4, Math.round((zf - 0.1) * 10) / 10); applyZoom(); });
    $('#bZp').addEventListener('click', function () { zf = Math.min(2, Math.round((zf + 0.1) * 10) / 10); applyZoom(); });
    $('#title').addEventListener('click', editTitle);
    $('#final').addEventListener('click', finalMenu);
    document.addEventListener('click', closeMenu);
    window.addEventListener('resize', applyZoom);
    document.addEventListener('keydown', function (e) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        undo();
      }
    });
    renderAll();
    updateUndo();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { fit(); applyZoom(); });
    }
  }

  init();
})();
</script>
</body>
</html>
`;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(HTML, {
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'no-cache',
          'x-content-type-options': 'nosniff'
        }
      });
    }
    if (url.pathname === '/favicon.ico') return new Response(null, { status: 204 });
    return new Response('Not found', { status: 404 });
  }
};
