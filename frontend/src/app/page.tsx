'use client';

import { useEffect, useState } from 'react';

type Expense = {
  id: number;
  amount: number;
  date: string;
  categoryId: number;
  category: { id: number; name: string };
};

export default function HomePage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    fetch('http://localhost:3000/expenses')
      .then(res => res.json())
      .then(setExpenses)
      .catch(console.error);
  }, []);

  return (
    <main>
      <h1>Liste des dépenses</h1>
      <ul>
        {expenses.map(expense => (
          <li key={expense.id}>
            {expense.category.name} : {expense.amount} € le{' '}
            {new Date(expense.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </main>
  );
}
