import { useState } from 'react'

export default function NewBoardModal({ onCreate, onClose }) {
  const [name, setName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    await onCreate(name.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <h2 className="text-lg font-bold text-indigo-900 mb-4">New Board</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            placeholder="Board name..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="border border-indigo-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-600">
              Cancel
            </button>
            <button type="submit"
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
