let charts = {};

function destroyIfExists(key){
  if(charts[key]){
    charts[key].destroy();
    delete charts[key];
  }
}

async function loadDashboard(){
  const res = await fetch("/api/dashboard-data");
  const d = await res.json();
  const sb = document.getElementById('statusBox');
  if(sb && d.status){
    const s = d.status;
    if(s.error){ sb.textContent = 'Status: ERROR - ' + s.error; }
    else if(s.running){ sb.textContent = 'Status: Processing video… (' + (s.video||'') + ')'; }
    else if(s.done){ sb.textContent = 'Status: Done (' + (s.video||'') + ')'; }
    else { sb.textContent = 'Status: Idle'; }
  }
  if(d.error){
    console.log(d.error);
    return;
  }

  // FLOW
  destroyIfExists("flow");
  charts.flow = new Chart(document.getElementById('flowChart'), {
    type: 'line',
    data: {
      labels: d.flow.labels,
      datasets: [{
        label: 'Traffic Flow (veh/sec)',
        data: d.flow.values,
        borderColor: '#5dade2',
        backgroundColor: 'rgba(93,173,226,0.2)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // DISTRIBUTION
  destroyIfExists("dist");
  charts.dist = new Chart(document.getElementById('distributionChart'), {
    type: 'pie',
    data: {
      labels: Object.keys(d.distribution),
      datasets: [{
        data: Object.values(d.distribution),
        backgroundColor: ['#f1c40f','#1abc9c','#3498db','#e74c3c','#9b59b6']
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });

  // CONGESTION
  destroyIfExists("cong");
  charts.cong = new Chart(document.getElementById('congestionChart'), {
    type: 'bar',
    data: {
      labels: d.congestion.labels,
      datasets: [{
        data: d.congestion.values,
        backgroundColor: '#5dade2'
      }]
    },
    options: { indexAxis: 'y', plugins: { legend: { display: false } } }
  });

  // PREDICTION
  destroyIfExists("pred");
  charts.pred = new Chart(document.getElementById('predictionChart'), {
    type: 'line',
    data: {
      labels: d.prediction.labels,
      datasets: [
        { label: 'Current Flow', data: d.prediction.actual, borderColor: '#3498db', tension: 0.4 },
        { label: 'Predicted Flow', data: d.prediction.predicted, borderColor: '#f1c40f', tension: 0.4 }
      ]
    }
  });
}

// initial + refresh every 2 seconds for live updates
loadDashboard();
setInterval(loadDashboard, 1000);
