/**
 * charts.js - Chart.js Visualizations for Helpdesk Analytics
 * Bannari Amman Institute of Technology Helpdesk
 *
 * All metrics are derived from actual Firestore database records.
 * Never fabricates statistics or unsupported AI scores.
 */

import { DEPARTMENTS, TICKET_STATUS } from './data.js';

let deptChartInstance = null;
let statusChartInstance = null;
let trendChartInstance = null;

function isDarkMode() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function getTextColor() {
  return isDarkMode() ? '#94a3b8' : '#64748b';
}

function getGridColor() {
  return isDarkMode() ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
}

/**
 * Renders Department-wise ticket distribution chart
 */
export function renderDepartmentChart(canvasId, tickets = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof window.Chart === 'undefined') return;

  if (deptChartInstance) {
    deptChartInstance.destroy();
  }

  // Aggregate actual database counts
  const counts = {
    NMC: 0,
    PS: 0,
    COE: 0,
    'Office Academics': 0,
    'manual-review': 0
  };

  tickets.forEach(t => {
    const d = t.departmentId || 'manual-review';
    if (counts[d] !== undefined) {
      counts[d]++;
    } else {
      counts['manual-review']++;
    }
  });

  const ctx = canvas.getContext('2d');
  deptChartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['NMC', 'PS', 'COE', 'Academics', 'Manual Review'],
      datasets: [{
        label: 'Tickets Assigned',
        data: [
          counts['NMC'],
          counts['PS'],
          counts['COE'],
          counts['Office Academics'],
          counts['manual-review']
        ],
        backgroundColor: [
          '#2563eb', // NMC
          '#7c3aed', // PS
          '#0891b2', // COE
          '#059669', // Office Academics
          '#d97706'  // Manual Review
        ],
        borderRadius: 8,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 10,
          cornerRadius: 8,
          bodyFont: { family: 'Poppins' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: getTextColor(), font: { family: 'Poppins', size: 11, weight: '500' } }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: getTextColor(), font: { family: 'Poppins', size: 11 } },
          grid: { color: getGridColor() }
        }
      }
    }
  });
}

/**
 * Renders Status distribution doughnut chart
 */
export function renderStatusChart(canvasId, tickets = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof window.Chart === 'undefined') return;

  if (statusChartInstance) {
    statusChartInstance.destroy();
  }

  const counts = {
    OPEN: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    ESCALATED: 0
  };

  tickets.forEach(t => {
    if (counts[t.status] !== undefined) {
      counts[t.status]++;
    } else {
      counts.OPEN++;
    }
  });

  const ctx = canvas.getContext('2d');
  statusChartInstance = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Open', 'In Progress', 'Resolved', 'Escalated'],
      datasets: [{
        data: [
          counts.OPEN,
          counts.IN_PROGRESS,
          counts.RESOLVED,
          counts.ESCALATED
        ],
        backgroundColor: [
          '#2563eb',
          '#d97706',
          '#16a34a',
          '#dc2626'
        ],
        borderWidth: 2,
        borderColor: isDarkMode() ? '#111827' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getTextColor(),
            font: { family: 'Poppins', size: 11 },
            boxWidth: 12,
            padding: 15
          }
        }
      }
    }
  });
}

/**
 * Renders Monthly complaint trends line chart
 */
export function renderMonthlyTrendChart(canvasId, tickets = []) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof window.Chart === 'undefined') return;

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  // Map tickets to months of the current year
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthCounts = new Array(12).fill(0);

  tickets.forEach(t => {
    if (t.createdAt) {
      const d = new Date(t.createdAt);
      if (!isNaN(d.getTime())) {
        monthCounts[d.getMonth()]++;
      }
    }
  });

  // Display the last 6 months up to current
  const currentMonthIdx = new Date().getMonth();
  const displayMonths = [];
  const displayCounts = [];

  for (let i = 5; i >= 0; i--) {
    const idx = (currentMonthIdx - i + 12) % 12;
    displayMonths.push(months[idx]);
    displayCounts.push(monthCounts[idx]);
  }

  const ctx = canvas.getContext('2d');
  trendChartInstance = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: displayMonths,
      datasets: [{
        label: 'Complaints Logged',
        data: displayCounts,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#4f46e5',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          bodyFont: { family: 'Poppins' },
          cornerRadius: 8
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: getTextColor(), font: { family: 'Poppins', size: 11 } }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: getTextColor(), font: { family: 'Poppins', size: 11 } },
          grid: { color: getGridColor() }
        }
      }
    }
  });
}
