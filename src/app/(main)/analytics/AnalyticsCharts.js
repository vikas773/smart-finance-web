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
import { useEffect, useState } from 'react'

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
  const [themeTokens, setThemeTokens] = useState({
    border: '#1e2d40',
    textMuted: '#8b95a9',
    tooltipBg: '#0d0f14'
  })

  useEffect(() => {
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

  // 12-Month Trend Line Chart
  const trendData = {
    labels: monthly.map(m => m.month),
    datasets: [
      {
        label: 'Income',
        data: monthly.map(m => m.income),
        borderColor: '#00d09c',
        backgroundColor: 'rgba(0, 208, 156, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHitRadius: 20
      },
      {
        label: 'Expense',
        data: monthly.map(m => m.expense),
        borderColor: '#eb5757',
        backgroundColor: 'rgba(235, 87, 87, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHitRadius: 20
      }
    ]
  }

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
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
      x: { grid: { display: false }, ticks: { color: themeTokens.textMuted, font: { family: "'DM Sans', sans-serif" } } },
      y: { 
        border: { display: false }, 
        grid: { color: themeTokens.border, drawTicks: false }, 
        ticks: { color: themeTokens.textMuted, font: { family: "'DM Mono', monospace" }, callback: v => '₹' + v.toLocaleString('en-IN') } 
      }
    }
  }

  // Doughnut Charts
  const getDoughnutData = (dataList) => ({
    labels: dataList.map(c => c.name),
    datasets: [{
      data: dataList.map(c => c.total),
      backgroundColor: dataList.map(c => c.color),
      borderWidth: 0,
      hoverOffset: 4
    }]
  })

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'right', 
        labels: { color: themeTokens.textMuted, font: { family: "'DM Sans', sans-serif", size: 12 }, usePointStyle: true, padding: 16 } 
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
    cutout: '70%'
  }

  // Daily Spending Bar Chart
  const dailySpendData = {
    labels: dailyLabels,
    datasets: [{
      label: 'Spending',
      data: dailyData,
      backgroundColor: '#eb5757',
      borderRadius: 4
    }]
  }

  const dailySpendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: themeTokens.tooltipBg,
        titleColor: themeTokens.textMuted,
        bodyColor: '#ffffff',
        padding: 12,
        borderColor: themeTokens.border,
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ₹${ctx.raw.toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: themeTokens.textMuted, font: { family: "'DM Sans', sans-serif" } } },
      y: { 
        border: { display: false }, 
        grid: { color: themeTokens.border, drawTicks: false }, 
        ticks: { color: themeTokens.textMuted, font: { family: "'DM Mono', monospace" }, callback: v => '₹' + v.toLocaleString('en-IN') } 
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* 12 Month Trend */}
      <div className="bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-semibold text-text-primary">12-Month Trend</h3>
          <div className="flex items-center gap-4 text-[12px] font-medium text-text-muted">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-green" /> Income
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-red" /> Expense
            </div>
          </div>
        </div>
        <div className="h-[300px] -mx-2">
          <Line data={trendData} options={trendOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200 flex flex-col">
          <h3 className="text-[16px] font-semibold text-text-primary mb-6">Expense by Category</h3>
          <div className="h-[260px] flex items-center justify-center">
            {catBreak.length > 0 ? (
              <Doughnut data={getDoughnutData(catBreak)} options={doughnutOptions} />
            ) : (
              <div className="text-center text-text-muted flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <PieChart className="w-8 h-8 text-text-muted" />
                </div>
                <p className="font-medium text-[15px] text-text-primary">No expense data</p>
              </div>
            )}
          </div>
        </div>

        {/* Income Sources */}
        <div className="bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200 flex flex-col">
          <h3 className="text-[16px] font-semibold text-text-primary mb-6">Income Sources</h3>
          <div className="h-[260px] flex items-center justify-center">
            {incSrc.length > 0 ? (
              <Doughnut data={getDoughnutData(incSrc)} options={doughnutOptions} />
            ) : (
              <div className="text-center text-text-muted flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <PieChart className="w-8 h-8 text-text-muted" />
                </div>
                <p className="font-medium text-[15px] text-text-primary">No income data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Spend This Month */}
      <div className="bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[16px] font-semibold text-text-primary">Daily Spending</h3>
          <div className="px-3 py-1 bg-bg-tertiary rounded-full text-[12px] font-medium text-text-secondary border border-border">
            Current Month
          </div>
        </div>
        <div className="h-[280px] -mx-2">
          <Bar data={dailySpendData} options={dailySpendOptions} />
        </div>
      </div>
    </div>
  )
}
