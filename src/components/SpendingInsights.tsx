import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

interface SpendingInsightsProps {
  transactions: Transaction[]
}

export function SpendingInsights({ transactions }: SpendingInsightsProps) {
  const now = new Date()
  const currentMonth = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)
  const lastMonth = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const currentMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' && date >= currentMonth && date <= currentMonthEnd
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' && date >= lastMonth && date <= lastMonthEnd
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const expenseChange = lastMonthExpenses > 0 
    ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0

  const topCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const topCategoryName = Object.entries(topCategory)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'

  const topCategoryAmount = topCategory[topCategoryName] || 0

  const averageTransaction = transactions.length > 0 
    ? transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) / transactions.filter(t => t.type === 'expense').length
    : 0

  const insights = [
    {
      title: 'Monthly Spending Trend',
      value: `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}%`,
      description: `vs ${format(lastMonth, 'MMM yyyy')}`,
      icon: expenseChange >= 0 ? TrendingUp : TrendingDown,
      color: expenseChange >= 0 ? 'text-red-600' : 'text-green-600',
      bgColor: expenseChange >= 0 ? 'bg-red-50' : 'bg-green-50',
    },
    {
      title: 'Top Spending Category',
      value: topCategoryName,
      description: formatCurrency(topCategoryAmount),
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Average Transaction',
      value: formatCurrency(averageTransaction),
      description: 'Per expense',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${insight.bgColor}`}>
                    <Icon className={`h-4 w-4 ${insight.color}`} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {insight.title}
                  </span>
                </div>
                <div>
                  <div className={`text-xl font-bold ${insight.color}`}>
                    {insight.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}