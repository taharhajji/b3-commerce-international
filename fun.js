/* Playful layer for the course pages: reading progress, section check-off, reveal cards, true/false mini-checks, hub stats. */
(function () {
  const course = location.pathname.split("/").filter(Boolean).slice(-2, -1)[0] || "";
  const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  /* Reading progress bar */
  if (document.querySelector("h2")) {
    const bar = document.createElement("div"); bar.className = "readbar"; document.body.prepend(bar);
    const upd = () => { const h = document.documentElement; bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%"; };
    addEventListener("scroll", upd, { passive: true }); upd();
  }

  /* Section check-off + mission bar */
  const secs = [...document.querySelectorAll("h2[id]")];
  const mission = document.getElementById("mission");
  if (secs.length && course) {
    const key = "b3:" + course + ":read";
    let done = new Set(ls.get(key) || []);
    const refresh = () => {
      if (!mission) return;
      const n = secs.filter(h => done.has(h.id)).length;
      mission.querySelector(".mbar i").style.width = (n / secs.length * 100) + "%";
      mission.querySelector(".mtxt").textContent = n === secs.length ? "Mission accomplie : toute la synthèse est cochée. Direction le quiz." : `${n} / ${secs.length} sections cochées`;
    };
    secs.forEach(h => {
      const b = document.createElement("button"); b.className = "done"; b.type = "button";
      const set = () => { const on = done.has(h.id); b.setAttribute("aria-pressed", on); b.textContent = on ? "✓ Vu" : "Marquer vu"; };
      b.onclick = () => { done.has(h.id) ? done.delete(h.id) : done.add(h.id); ls.set(key, [...done]); set(); refresh(); };
      set(); h.appendChild(b);
    });
    refresh();
  }

  /* Reveal cards */
  document.querySelectorAll(".reveal").forEach(r => { r.onclick = () => r.classList.toggle("open"); });

  /* True / false mini-checks: <div class="vf" data-title="…"><div class="item" data-a="v" data-why="…"><p>…</p></div>…</div> */
  document.querySelectorAll(".vf").forEach(box => {
    const items = [...box.querySelectorAll(".item")]; let answered = 0, good = 0;
    const tally = document.createElement("p"); tally.className = "tally";
    items.forEach(it => {
      const btns = document.createElement("div"); btns.className = "btns";
      [["v", "Vrai"], ["f", "Faux"]].forEach(([val, label]) => {
        const b = document.createElement("button"); b.type = "button"; b.textContent = label;
        b.onclick = () => {
          if (it.dataset.done) return; it.dataset.done = 1; answered++;
          const ok = val === it.dataset.a; if (ok) good++;
          b.className = ok ? "ok" : "ko";
          [...btns.children].forEach(x => { x.disabled = true; if (x.textContent === (it.dataset.a === "v" ? "Vrai" : "Faux")) x.className = "ok"; });
          const why = document.createElement("p"); why.className = "why"; why.textContent = (ok ? "Exact. " : "Non. ") + it.dataset.why; it.appendChild(why);
          tally.textContent = answered === items.length ? (good === items.length ? `${good}/${items.length}. Sans faute, tu peux cocher la section.` : `${good}/${items.length}. Relis le passage juste au-dessus.`) : `${good}/${answered}`;
        };
        btns.appendChild(b);
      });
      it.appendChild(btns);
    });
    box.appendChild(tally);
  });

  /* Hub stats */
  const hub = document.getElementById("hubstats");
  if (hub) {
    const cards = [...document.querySelectorAll("[data-course]")]; let total = 0, badges = 0;
    cards.forEach(c => {
      const id = c.dataset.course; const xp = ls.get("b3:" + id + ":xp") || 0; total += xp; badges += (ls.get("b3:" + id + ":badges") || []).length;
      const st = ls.get("b3:" + id + ":stats") || {}; const vals = Object.values(st); const n = vals.reduce((a, s) => a + s.n, 0), ok = vals.reduce((a, s) => a + s.ok, 0);
      const read = (ls.get("b3:" + id + ":read") || []).length;
      const m = c.querySelector(".mini");
      if (m) m.innerHTML = `<span>${xp} XP</span><span>${read} section${read > 1 ? "s" : ""} lue${read > 1 ? "s" : ""}</span><span class="bar"><i style="width:${n ? Math.round(ok / n * 100) : 0}%"></i></span><span>${n ? Math.round(ok / n * 100) + " % de réussite" : "pas encore joué"}</span>`;
    });
    const lvl = Math.floor(Math.sqrt(total / 60)) + 1, lo = (lvl - 1) ** 2 * 60, hi = lvl ** 2 * 60;
    hub.innerHTML = `<b>Niveau ${lvl}</b><span class="xpbar"><i style="width:${Math.round((total - lo) / (hi - lo) * 100)}%"></i></span><span>${total} XP au total</span><span>🏅 ${badges} badge${badges > 1 ? "s" : ""}</span>`;
  }
})();
