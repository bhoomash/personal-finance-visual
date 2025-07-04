import React, { useState } from 'react'
import { Plus, Wallet, BarChart3, PieChart, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionForm } from '@/components/TransactionForm'
import { TransactionList } from '@/components/TransactionList'
import { MonthlyExpensesChart } from '@/components/MonthlyExpensesChart'
import { CategoryPieChart } from '@/components/CategoryPieChart'
import { SummaryCards } from '@/components/SummaryCards'
import { BudgetOverview } from '@/components/BudgetOverview'
import { SpendingInsights } from '@/components/SpendingInsights'
import { Transaction } from '@/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', [])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics' | 'budget'>('dashboard')

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
    }
    setTransactions(prev => [...prev, newTransaction])
  }

  const handleEditTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      setTransactions(prev =>
        prev.map(t =>
          t.id === editingTransaction.id
            ? { ...transactionData, id: editingTransaction.id }
            : t
        )
      )
      setEditingTransaction(undefined)
    }
  }

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const openEditForm = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingTransaction(undefined)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'budget', label: 'Budget', icon: Target },
  ] as const

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Personal Finance</h1>
            <p className="text-slate-600 mt-1">Track your expenses and manage your budget</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Card className="mb-8">
          <CardContent className="p-0">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <>
              <SummaryCards transactions={transactions} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MonthlyExpensesChart transactions={transactions} />
                <CategoryPieChart transactions={transactions} />
              </div>
              <SpendingInsights transactions={transactions} />
            </>
          )}

          {activeTab === 'transactions' && (
            <TransactionList
              transactions={transactions}
              onEdit={openEditForm}
              onDelete={handleDeleteTransaction}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <MonthlyExpensesChart transactions={transactions} />
              <CategoryPieChart transactions={transactions} />
              <div className="lg:col-span-2">
                <SpendingInsights transactions={transactions} />
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BudgetOverview transactions={transactions} />
              <CategoryPieChart transactions={transactions} />
            </div>
          )}
        </div>

        {/* Transaction Form Modal */}
        <TransactionForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          transaction={editingTransaction}
        />
      </div>
    </div>
  )
}

export default App