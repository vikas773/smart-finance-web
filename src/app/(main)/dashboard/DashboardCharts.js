'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import { Inbox } from 'lucide-react'
import { useEffect, useState } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

export default function DashboardCharts({ chartData, catData }) {
  const [themeTokens, setThemeTokens] = useState({
    border: '#1e2d40',
    textMuted: '#8b95a9',
    tooltipBg: '#0d0f14'
  })

  useEffect(() => {
    // Basic detection for dark/light mode token reading could be done here
    // For now, these are standard dark mode default values
    const isLight = document.documentElement.classList.contains('light')
    if (isLight) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeTokens({
        border: '#e2e6f0',
        textMuted: '#4f5e78',
        tooltipBg: '#ffffff'
      })
    }
  }, [])

  const labels = chartData.map(d => d.month).reverse()
  const incData = chartData.map(d => d.income).reverse()
  const expData = chartData.map(d => d.expense).reverse()

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incData,
        borderColor: '#00d09c',
        backgroundColor: 'rgba(0, 208, 156, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHitRadius: 20,
      },
      {
        label: 'Expense',
        data: expData,
        borderColor: '#eb5757',
        backgroundColor: 'rgba(235, 87, 87, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHitRadius: 20,
      }
    ]
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: themeTokens.tooltipBg,
        titleColor: themeTokens.textMuted,
        bodyColor: '#ffffff',
        padding: 12,
        borderColor: themeTokens.border,
        borderWidth: 1,
        boxPadding: 4,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: themeTokens.textMuted, font: { family: "'DM Sans', sans-serif" } }
      },
      y: {
        border: { display: false },
        grid: { color: themeTokens.border, drawTicks: false },
        ticks: {
          color: themeTokens.textMuted,
          font: { family: "'DM Mono', monospace" },
          padding: 10,
          callback: v => '₹' + v.toLocaleString('en-IN')
        }
      }
    }
  }

  const doughnutData = {
    labels: catData.map(c => c.name),
    datasets: [{
      data: catData.map(c => c.total),
      backgroundColor: catData.map(c => c.color),
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
        labels: { 
          color: themeTokens.textMuted, 
          font: { family: "'DM Sans', sans-serif", size: 13 },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: themeTokens.tooltipBg,
        bodyColor: '#ffffff',
        padding: 12,
        borderColor: themeTokens.border,
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ₹${ctx.raw.toLocaleString('en-IN')}`
        }
      }
    },
    cutout: '75%'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-semibold text-text-primary">Income vs Expenses</h3>
          <div className="flex items-center gap-4 text-[12px] font-medium text-text-muted">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-green" /> Income
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-red" /> Expense
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-[260px] -mx-2">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      <div className="lg:col-span-1 bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200 flex flex-col">
        <h3 className="text-[16px] font-semibold text-text-primary mb-6">Expense by Category</h3>
        <div className="flex-1 flex items-center justify-center min-h-[260px]">
          {catData.length > 0 ? (
            <div className="w-full h-[240px]">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="text-center text-text-muted">
              <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4 mx-auto">
                <Inbox className="w-8 h-8 text-text-muted" />
              </div>
              <p className="font-medium text-[15px] text-text-primary">No expenses</p>
              <p className="text-[13px] mt-1">Nothing to show this month.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
