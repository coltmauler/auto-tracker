import { formatExpenseDate, formatMoney, sortExpensesDescending } from '../lib/expenses.js'

function ExpenseList({ preferences, expenses, onDeleteRecord, onEditRecord }) {
  const sortedExpenses = sortExpensesDescending(expenses)
  const dateFormat = preferences?.dateFormat ?? 'mdy'
  const currencySymbol = preferences?.currencySymbol ?? '$'

  if (sortedExpenses.length === 0) {
    return (
      <section className="page-panel">
        <div className="empty-state">
          <h3>No expenses yet</h3>
          <p>Add a repair, fee, or ownership cost to start the expense history.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">Expenses</p>
          <h2>Vehicle expenses</h2>
        </div>
      </div>

      <div className="document-list">
        {sortedExpenses.map((expense) => (
          <article key={expense.id} className="document-card expense-card">
            <div className="vehicle-card-header">
              <div>
                <p className="vehicle-title">{expense.category}</p>
                <p className="vehicle-subtitle">
                  {formatExpenseDate(expense.date, dateFormat)} - {formatMoney(expense.amount, currencySymbol)}
                </p>
              </div>
              <div className="vehicle-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onEditRecord(expense)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDeleteRecord(expense.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="document-meta-row">
              <span className="document-badge">{expense.vendor || 'No vendor'}</span>
            </div>

            <dl className="vehicle-details maintenance-details document-details">
              <div>
                <dt>Date</dt>
                <dd>{formatExpenseDate(expense.date, dateFormat)}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{formatMoney(expense.amount, currencySymbol)}</dd>
              </div>
              <div className="vehicle-notes">
                <dt>Notes</dt>
                <dd>{expense.notes || 'No notes yet'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ExpenseList
