/* =========================================================
   ship-scene.js
   ページ内の .ship-scene を見つけて、スクロール連動のアニメーションを付けます。
   外部ライブラリ不要。</body> の直前で読み込んでください。
   ========================================================= */
(() => {
  // ---------------------------------------------------------
  // 調整用の設定（座標はすべて glass_base 画像 3162px 四方の中での位置）
  // ---------------------------------------------------------
  const CONFIG = {
    nearSpan: 340,                        // 最初のアップ：画面の短辺に映す画像の幅（小さいほど寄る）
    whole: { x:1675, y:1600, span:2560 },  // 最後の全体像：中心と映す幅
    lookAhead: { x:0, y:-28 },            // 船の少し先（上）を画面中央に置く
    sail: [0.04, 0.80],                   // 進行度 0〜1 のうち、船が進む区間
    zoom: [0.12, 0.94],                   // 進行度 0〜1 のうち、カメラが引く区間
    zoomCurve: 1.6,                       // 大きいほど「前半は寄ったまま、山に近づいてから一気に引く」
    lines: [                              // ことばの [出始め, 出きる, 消え始め, 消えきる]
      [-1, -1, 0.14, 0.22],
      [0.36, 0.44, 0.60, 0.68],
      [0.88, 0.94, 2, 2],
      [0.86, 0.93, 2, 2],                 // 最後の「のんだどん」（.ship-scene__brand）
    ],
    nearScale: 1.22,                      // 手前（出発時）の船の大きさ。到着時が 1
    smoothing: 0.1,                       // スクロールへの追従のなめらかさ（小さいほどぬるっと）
    turnSpeed: 0.14,                      // 向きを切り替えるときの重なりの速さ
  };

  const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
  const range = (p,[a,b]) => clamp((p-a)/(b-a), 0, 1);
  const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  const easeSine  = t => -(Math.cos(Math.PI*t) - 1)/2;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setup(root){
    const q = s => root.querySelector(s);
    const art   = q('.ship-scene__art');
    const fx    = q('.ship-scene__fx');
    const route = q('.ship-scene__route');
    const ship  = q('.ship-scene__ship');
    const hint  = q('.ship-scene__hint');
    const lines = [1,2,3].map(n => q('.ship-scene__line--' + n)).concat(q('.ship-scene__brand'));
    const views = {
      left:  q('[data-view="left"]'),
      back:  q('[data-view="back"]'),
      right: q('[data-view="right"]'),
    };
    const weight = { left:1, back:0, right:0 };
    let heading = 'left';

    const L = route.getTotalLength();
    let target = 0, current = 0, vw = innerWidth, vh = innerHeight;
    let visible = true, rafId = 0;

    function readScroll(){
      const r = root.getBoundingClientRect();
      target = clamp(-r.top / (root.offsetHeight - vh), 0, 1);
    }

    function render(p, time){
      // 船の位置と進行方向
      const u = easeSine(range(p, CONFIG.sail));
      const d = u * L;
      const pos = route.getPointAtLength(d);
      const a = route.getPointAtLength(Math.max(0, d - 14));
      const b = route.getPointAtLength(Math.min(L, d + 14));
      const dx = b.x - a.x, dy = b.y - a.y;
      const hx = dx / (Math.hypot(dx, dy) || 1);
      if (hx < -0.42) heading = 'left';
      else if (hx > 0.42) heading = 'right';
      else if (Math.abs(hx) < 0.28) heading = 'back';

      // カメラ：ズームは対数で補間し、中心は「引いた量」に応じて船から全体へ移す
      const t = Math.pow(easeInOut(range(p, CONFIG.zoom)), CONFIG.zoomCurve);
      const n = CONFIG.nearSpan, w = CONFIG.whole;
      const span = Math.exp(Math.log(n) + (Math.log(w.span) - Math.log(n)) * t);
      const k = (span - n) / (w.span - n);
      const fx0 = pos.x + CONFIG.lookAhead.x, fy0 = pos.y + CONFIG.lookAhead.y;
      const cx = fx0 + (w.x - fx0) * k;
      const cy = fy0 + (w.y - fy0) * k;
      const s = Math.min(vw, vh) / span;

      art.style.transform = `translate3d(${vw/2 - cx*s}px, ${vh/2 - cy*s}px, 0) scale(${s})`;
      const vbw = vw / s, vbh = vh / s;
      fx.setAttribute('viewBox', `${cx - vbw/2} ${cy - vbh/2} ${vbw} ${vbh}`);

      // 航跡：船が通ったところまで見せる
      route.style.strokeDasharray = `${d} ${L + 20}`;

      // 船：遠近・ゆれ・向き
      const size = 1 + (CONFIG.nearScale - 1) * (1 - u);
      const rot  = reduce ? 0 : Math.sin(time/480) * 1.6;
      const lift = reduce ? 0 : Math.sin(time/480 + 1.2) * 1.1;
      ship.setAttribute('transform', `translate(${pos.x} ${pos.y + lift}) rotate(${rot}) scale(${size})`);
      for (const key in views) views[key].style.opacity = weight[key].toFixed(3);

      // ことば
      lines.forEach((el, i) => {
        if (!el) return;
        const [a1,b1,c1,d1] = CONFIG.lines[i];
        const o = p < a1 ? 0 : p < b1 ? (p-a1)/(b1-a1) : p < c1 ? 1 : p < d1 ? 1-(p-c1)/(d1-c1) : 0;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translateY(${(1-o)*14}px)`;
      });
      if (hint) hint.style.opacity = p > 0.03 ? 0 : 1;
    }

    function tick(time){
      current += (target - current) * (reduce ? 1 : CONFIG.smoothing);
      if (Math.abs(target - current) < 0.0002) current = target;
      for (const key in weight){
        const goal = key === heading ? 1 : 0;
        weight[key] += (goal - weight[key]) * (reduce ? 1 : CONFIG.turnSpeed);
      }
      render(current, time);
      rafId = visible ? requestAnimationFrame(tick) : 0;
    }

    // 画面外にあるあいだは止めて、ページ全体を軽く保つ
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !rafId) rafId = requestAnimationFrame(tick);
    }).observe(root);

    addEventListener('scroll', readScroll, { passive:true });
    addEventListener('resize', () => { vw = innerWidth; vh = innerHeight; readScroll(); });

    readScroll(); current = target;
    render(current, 0);
    for (const key in weight) weight[key] = key === heading ? 1 : 0;
    render(current, 0);
    rafId = requestAnimationFrame(tick);
  }

  const start = () => document.querySelectorAll('.ship-scene').forEach(setup);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
