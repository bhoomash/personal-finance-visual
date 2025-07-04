export interface Transaction {
  id: string
  amount: number
  description: string
  date: Date
  category: string
  type: 'income' | 'expense'
}

export interface Category {
  id: string
  name: string
  color: string
  budget?: number
}

export interface MonthlyData {
  month: string
  expenses: number
  income: number
}

export interface CategoryData {
  name: string
  value: number
  color: string
}

export interface Budget {
  categoryId: string
  amount: number
  spent: number
}