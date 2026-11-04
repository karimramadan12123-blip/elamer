/* عامل الخدمة: يخزّن ملفات التطبيق ليعمل بدون إنترنت.
   لا يلمس بياناتك أبدًا (البيانات في تخزين المتصفح وليست هنا). تحديث التطبيق لا يمسح البيانات. */
const CACHE = 'alamer-shell-v6';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('alamer-') && k !== CACHE && k !== 'alamer-fonts-v1').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // الصفحة: الشبكة أولًا (لتصل التحديثات) ثم النسخة المخزنة بدون إنترنت
    if (req.mode === 'navigate') {
      e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html')));
      return;
    }
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })));
    return;
  }
  // الخطوط: تُخزَّن عند أول تحميل وتعمل بدون إنترنت بعدها
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open('alamer-fonts-v1').then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => { c.put(req, r.clone()); return r; }).catch(() => hit))));
  }
});
