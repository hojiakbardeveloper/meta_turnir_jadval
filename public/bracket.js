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

  let html = '<div class="bracket-scroll"><div class="bracket-wrap">';
  bracket.rounds.forEach((round, r) => {
    html += '<div class="bracket-round">';
    html += '<div class="bracket-round-label">' + roundLabel(r, totalRounds) + "</div>";
    round.forEach((m, i) => {
      const aName = nameOf(bracket, m.a);
      const bName = nameOf(bracket, m.b);
      html += '<div class="bmatch">';

      // Slot A
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

      // Slot B
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
}
