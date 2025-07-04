import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { defaultCategories } from '@/data/categories'
import { startOfMonth, endOfMonth } from 'date-fns'

interface BudgetOverviewProps {
  transactions: Transaction[]
}

export function BudgetOverview({ transactions }: BudgetOverviewProps) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const currentMonthExpenses = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    return transactionDate >= monthStart && 
           transactionDate <= monthEnd && 
           transaction.type === 'expense'
  })

  const budgetData = defaultCategories
    .filter(category => category.budget && category.budget > 0 && category.name !== 'Income')
    .map(category => {
      const spent = currentMonthExpenses
        .filter(t => t.category === category.name)
        .reduce((sum, t) => sum + t.amount, 0)
      
      const budget = category.budget || 0
      const percentage = budget > 0 ? (spent / budget) * 100 : 0
      
      return {
        category: category.name,
        spent,
        budget,
        percentage: Math.min(percentage, 100),
        color: category.color,
        isOverBudget: spent > budget
      }
    })
    .sort((a, b) => b.percentage - a.percentage)

  if (budgetData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No budget data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgetData.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <span className={`font-medium ${item.isOverBudget ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                  </span>
                </div>
              </div>
              <Progress 
                value={item.percentage} 
                className="h-2"
                style={{
                  '--progress-background': item.isOverBudget ? '#ef4444' : item.color
                } as React.CSSProperties}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.percentage.toFixed(1)}% used</span>
                {item.isOverBudget && (
                  <span className="text-red-600 font-medium">
                    Over budget by {formatCurrency(item.spent - item.budget)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}