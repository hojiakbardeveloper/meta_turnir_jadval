// Shared single-elimination bracket renderer.
// bracket = { teams: [{id,name}], rounds: [ [ {a,b,winner}, ... ], ... ] }
// opts.editable = true enables winner-selection buttons (admin only)

function nameOf(bracket, id) {
  if (!id) return null;
  const t = bracket.teams.find((x) => x.id === id);
  return t ? t.name : id;
}

function escapeHtmlBr(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function roundLabel(roundIndex, totalRounds) {
  const remaining = totalRounds - roundIndex;
  if (remaining === 1) return "Final";
  if (remaining === 2) return "Yarim final";
  if (remaining === 3) return "Chorak final";
  return "1/" + Math.pow(2, remaining) + " final";
}

function renderBracket(container, bracket, editable) {
  if (!bracket) {
    container.innerHTML = '<div class="loading">Bu sport uchun setka hali yaratilmagan.</div>';
    return;
  }
  const totalRounds = bracket.rounds.length;

  let html = '<div class="bracket-scroll"><div class="bracket-wrap" style="position:relative;">';
  html += '<svg class="bracket-lines"></svg>';
  bracket.rounds.forEach((round, r) => {
    html += '<div class="bracket-round">';
    html += '<div class="bracket-round-label">' + roundLabel(r, totalRounds) + "</div>";
    round.forEach((m, i) => {
      const aName = nameOf(bracket, m.a);
      const bName = nameOf(bracket, m.b);
      html += '<div class="bmatch">';

      if (!m.a) {
        html += '<div class="bslot empty">Aniqlanmagan</div>';
      } else {
        const isWin = m.winner === m.a;
        html += '<div class="bslot' + (isWin ? " win" : "") + '">' + "<span>" + escapeHtmlBr(aName) + "</span>";
        if (editable && m.a && m.b && !m.winner) {
          html += '<button data-r="' + r + '" data-i="' + i + '" data-team="' + m.a + '">G\'olib</button>';
        }
        html += "</div>";
      }

      if (!m.b) {
        html += '<div class="bslot empty">' + (m.a ? "Bye (avtomatik o'tadi)" : "Aniqlanmagan") + "</div>";
      } else {
        const isWin = m.winner === m.b;
        html += '<div class="bslot' + (isWin ? " win" : "") + '">' + "<span>" + escapeHtmlBr(bName) + "</span>";
        if (editable && m.a && m.b && !m.winner) {
          html += '<button data-r="' + r + '" data-i="' + i + '" data-team="' + m.b + '">G\'olib</button>';
        }
        html += "</div>";
      }

      html += "</div>";
    });
    html += "</div>";
  });
  html += "</div></div>";

  const finalMatch = bracket.rounds[totalRounds - 1][0];
  if (finalMatch && finalMatch.winner) {
    html +=
      '<div class="champion-card"><div class="medal">🏆</div><div class="name">' +
      escapeHtmlBr(nameOf(bracket, finalMatch.winner)) +
      "</div></div>";
  }

  container.innerHTML = html;

  // Draw connector lines once the DOM has laid out (need a tick for accurate measurements)
  requestAnimationFrame(() => drawConnectors(container));
  // Redraw on resize so lines stay aligned with responsive/zoom changes
  if (!container._bracketResizeBound) {
    container._bracketResizeBound = true;
    window.addEventListener("resize", () => drawConnectors(container));
  }
}

function drawConnectors(container) {
  const wrap = container.querySelector(".bracket-wrap");
  const svg = container.querySelector("svg.bracket-lines");
  if (!wrap || !svg) return;

  const w = wrap.scrollWidth;
  const h = wrap.scrollHeight;
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", "0 0 " + w + " " + h);

  const wrapRect = wrap.getBoundingClientRect();
  const roundEls = wrap.querySelectorAll(".bracket-round");
  let linesHTML = "";

  for (let r = 0; r < roundEls.length - 1; r++) {
    const matchesR = roundEls[r].querySelectorAll(".bmatch");
    const matchesNext = roundEls[r + 1].querySelectorAll(".bmatch");
    for (let k = 0; k < matchesNext.length; k++) {
      const m1 = matchesR[2 * k];
      const m2 = matchesR[2 * k + 1];
      const target = matchesNext[k];
      if (!m1 || !m2 || !target) continue;

      const r1 = m1.getBoundingClientRect();
      const r2 = m2.getBoundingClientRect();
      const rt = target.getBoundingClientRect();

      const x1 = r1.right - wrapRect.left;
      const y1 = r1.top + r1.height / 2 - wrapRect.top;
      const y2 = r2.top + r2.height / 2 - wrapRect.top;
      const xt = rt.left - wrapRect.left;
      const yt = rt.top + rt.height / 2 - wrapRect.top;
      const midX = x1 + (xt - x1) / 2;

      linesHTML +=
        `<line x1="${x1}" y1="${y1}" x2="${midX}" y2="${y1}"></line>` +
        `<line x1="${x1}" y1="${y2}" x2="${midX}" y2="${y2}"></line>` +
        `<line x1="${midX}" y1="${y1}" x2="${midX}" y2="${y2}"></line>` +
        `<line x1="${midX}" y1="${(y1 + y2) / 2}" x2="${xt}" y2="${yt}"></line>`;
    }
  }

  svg.innerHTML = linesHTML;
}
