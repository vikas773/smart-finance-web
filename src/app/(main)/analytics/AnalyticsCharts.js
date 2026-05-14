'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { PieChart } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

export default function AnalyticsCharts({ monthly, catBreak, incSrc, dailyLabels, dailyData }) {
  // 12-Month Trend Line Chart
  const trendData = {
    labels: monthly.map(m => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthly.map(m => m.income),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4
      },
      {
        label: 'Expense',
        data: monthly.map(m => m.expense),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4
      }
    ]
  }

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8' } }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', callback: v => '₹' + v.toLocaleString() } }
    }
  }

  // Category Expense Doughnut
  const catData = {
    labels: catBreak.map(c => c.name),
    datasets: [{
      data: catBreak.map(c => c.total),
      backgroundColor: catBreak.map(c => c.color + 'cc'),
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  // Income Sources Doughnut
  const incData = {
    labels: incSrc.map(c => c.name),
    datasets: [{
      data: incSrc.map(c => c.total),
      backgroundColor: incSrc.map(c => c.color + 'cc'),
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 } }
    },
    cutout: '60%'
  }

  // Daily Spending Bar Chart
  const dailySpendData = {
    labels: dailyLabels,
    datasets: [{
      label: 'Spending',
      data: dailyData,
      backgroundColor: 'rgba(99,102,241,0.6)',
      borderRadius: 4
    }]
  }

  const dailySpendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', callback: v => '₹' + v } }
    }
  }

  return (
    <div className="space-y-8">
      {/* 12 Month Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">12-Month Income vs Expense Trend</h3>
        <div className="h-80">
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Expense by Category (All Time)</h3>
          <div className="h-64 flex items-center justify-center">
            {catBreak.length > 0 ? (
              <Doughnut data={catData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-slate-500">
                <PieChart className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No expense data</p>
              </div>
            )}
          </div>
        </div>

        {/* Income Sources */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Income Sources (All Time)</h3>
          <div className="h-64 flex items-center justify-center">
            {incSrc.length > 0 ? (
              <Doughnut data={incData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-slate-500">
                <PieChart className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No income data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Spend This Month */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Daily Spending – Current Month</h3>
        <div className="h-72">
          <Bar data={dailySpendData} options={dailySpendOptions} />
        </div>
      </div>
    </div>
  )
}
