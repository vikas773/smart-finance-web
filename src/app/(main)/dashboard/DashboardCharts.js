'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { Inbox } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function DashboardCharts({ chartData, catData }) {
  const labels = chartData.map(d => d.month).reverse()
  const incData = chartData.map(d => d.income).reverse()
  const expData = chartData.map(d => d.expense).reverse()

  const barData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incData,
        backgroundColor: 'rgba(34,197,94,0.8)',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: expData,
        backgroundColor: 'rgba(239,68,68,0.8)',
        borderRadius: 4,
      }
    ]
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 12 } }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#64748b',
          callback: v => '₹' + v.toLocaleString()
        }
      }
    }
  }

  const doughnutData = {
    labels: catData.map(c => c.name),
    datasets: [{
      data: catData.map(c => c.total),
      backgroundColor: catData.map(c => c.color + 'cc'),
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', font: { size: 12 }, padding: 16 }
      }
    },
    cutout: '70%'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Income vs Expenses (6 Months)</h3>
        <div className="h-64">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Expense by Category</h3>
        <div className="h-64 flex items-center justify-center">
          {catData.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="text-center text-slate-500">
              <Inbox className="w-12 h-12 mb-3 mx-auto text-slate-600" />
              <p>No expense data this month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
