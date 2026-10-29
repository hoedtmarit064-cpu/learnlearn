// ------------------------------------------------------------
// Charts (uses the Chart.js library loaded in index.html)
// ------------------------------------------------------------

const Charts = { kcal: null, weight: null };

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function chartsAvailable(canvas) {
  if (typeof Chart !== "undefined") return true;
  canvas.parentElement.innerHTML = '<p class="empty">Charts need an internet connection.</p>';
  return false;
}

function baseOptions() {
  const text = cssVar("--muted");
  const grid = cssVar("--line");
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { labels: { color: text, boxWidth: 12 } } },
    scales: {
      x: { ticks: { color: text, maxRotation: 0, autoSkip: true }, grid: { display: false } },
      y: { ticks: { color: text }, grid: { color: grid } },
    },
  };
}

// labels: ["Mon 3", ...], net: [kcal or null], goal: number
function drawKcalChart(labels, net, goal) {
  const canvas = document.getElementById("chart-kcal");
  if (!canvas || !chartsAvailable(canvas)) return;
  if (Charts.kcal) Charts.kcal.destroy();

  Charts.kcal = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Net kcal",
          data: net,
          backgroundColor: cssVar("--accent"),
          borderRadius: 4,
        },
        {
          label: "Goal",
          data: labels.map(() => goal),
          type: "line",
          borderColor: cssVar("--warn"),
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    },
    options: baseOptions(),
  });
}

// points: [{ date, kg }], goalWeight: number or null
function drawWeightChart(points, goalWeight) {
  const canvas = document.getElementById("chart-weight");
  if (!canvas || !chartsAvailable(canvas)) return;
  if (Charts.weight) Charts.weight.destroy();

  const labels = points.map(p => shortDate(p.date));
  const datasets = [{
    label: "Weight (kg)",
    data: points.map(p => p.kg),
    borderColor: cssVar("--accent"),
    backgroundColor: cssVar("--accent"),
    tension: 0.3,
    pointRadius: 3,
  }];
  if (goalWeight) {
    datasets.push({
      label: "Goal",
      data: labels.map(() => goalWeight),
      borderColor: cssVar("--warn"),
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: 0,
    });
  }
  Charts.weight = new Chart(canvas, { type: "line", data: { labels, datasets }, options: baseOptions() });
}
