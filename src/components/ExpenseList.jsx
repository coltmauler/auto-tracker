import { formatExpenseDate, formatMoney, sortExpensesDescending } from '../lib/expenses.js'

function ExpenseList({ expenses, onDeleteRecord, onEditRecord }) {
  const sortedExpenses = sortExpensesDescending(expenses)

  if (sortedExpenses.length === 0) {
    return (
      <section className="page-panel">
        <div className="empty-state">
          <h3>No expenses yet</h3>
          <p>Add the first expense above.</p>
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
                  {formatExpenseDate(expense.date)} - {formatMoney(expense.amount)}
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
                <dd>{formatExpenseDate(expense.date)}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{formatMoney(expense.amount)}</dd>
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
