let playerCount = 4;

function setPlayers(n) {
    playerCount = n;
    // Update UI buttons
    [3, 4, 5].forEach((num) => {
        document.getElementById(`btn-${num}`).classList.toggle("active", num === n);
    });
    renderPlayers();
}

function renderPlayers() {
    const el = document.getElementById("player-inputs");
    el.innerHTML = "";
    for (let i = 0; i < playerCount; i++) {
        el.innerHTML += `
    <div class="player-row">
      <div class="player-label">Player ${i + 1}</div>
      <div class="player-input-wrap">
        <input type="number" id="beans-${i}" placeholder="0" min="0" value="">
      </div>
    </div>`;
    }
}

function calculate() {
    const pv = parseFloat(document.getElementById("point-val").value) || 0.25;
    const beans = [];
    const names = [];

    for (let i = 0; i < playerCount; i++) {
        names.push("Player " + (i + 1));
        beans.push(parseFloat(document.getElementById("beans-" + i).value) || 0);
    }

    const totalSum = beans.reduce((a, b) => a + b, 0);

    // Logic: (n * b) - totalSum
    const totals = beans.map((b) => playerCount * b - totalSum);
    const owes = totals.map((t) => t * pv);
    const sumCheck = owes.reduce((s, x) => s + x, 0);

    const tbody = document.getElementById("results-body");
    tbody.innerHTML = "";

    const indices = [...Array(playerCount).keys()];
    const sorted = indices.sort((a, b) => totals[b] - totals[a]);

    sorted.forEach((i) => {
        const t = totals[i],
            o = owes[i];
        const tCls = t > 0 ? "pos" : t < 0 ? "neg" : "zero";
        const oCls = o > 0 ? "pos" : o < 0 ? "neg" : "zero";
        const winner = i === sorted[0] && t > 0 ? " winner-row" : "";

        tbody.innerHTML += `
    <tr class="${winner}">
      <td class="big-name">${names[i]}</td>
      <td style="text-align:center">${beans[i]}</td>
      <td class="${tCls}" style="text-align:center">${t > 0 ? "+" : ""}${t}</td>
      <td class="${oCls}">${o >= 0 ? "+$" : "−$"}${Math.abs(o).toFixed(2)}</td>
    </tr>`;
    });

    document.getElementById("sum-check").textContent =
        Math.abs(sumCheck) < 0.01 ? "✓ All totals sum to zero" : "⚠ Check your bean counts";

    // Settle payments
    const debtors = names
        .map((_, i) => ({ i, a: owes[i] }))
        .filter((x) => x.a < -0.004)
        .sort((a, b) => a.a - b.a);
    const creditors = names
        .map((_, i) => ({ i, a: owes[i] }))
        .filter((x) => x.a > 0.004)
        .sort((a, b) => b.a - a.a);
    const txns = [];
    let di = 0,
        ci = 0;

    while (di < debtors.length && ci < creditors.length) {
        const amt = Math.min(-debtors[di].a, creditors[ci].a);
        if (amt > 0.004) txns.push({ from: debtors[di].i, to: creditors[ci].i, amt });
        debtors[di].a += amt;
        creditors[ci].a -= amt;
        if (Math.abs(debtors[di].a) < 0.004) di++;
        if (Math.abs(creditors[ci].a) < 0.004) ci++;
    }

    const ledger = document.getElementById("ledger");
    if (txns.length === 0) {
        ledger.innerHTML = '<p class="zero-msg">All square — no payments needed!</p>';
    } else {
        ledger.innerHTML = txns
            .map(
                (t) => `
      <div class="ledger-row">
        <span>${names[t.from]}</span>
        <span style="color:#aaa;font-size:13px">pays ${names[t.to]}</span>
        <span class="ledger-amt">$${t.amt.toFixed(2)}</span>
      </div>`
            )
            .join("");
    }

    document.getElementById("results").style.display = "block";
    document.getElementById("results").scrollIntoView({ behavior: "smooth" });
}

function reset() {
    document.getElementById("results").style.display = "none";
    renderPlayers();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

renderPlayers();
