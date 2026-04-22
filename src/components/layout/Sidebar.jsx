import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoards } from '../../hooks/useBoards'
import NewBoardModal from '../boards/NewBoardModal'

export default function Sidebar() {
  const { boards, createBoard } = useBoards()
  const { boardId } = useParams()
  const navigate = useNavigate()
  const [showNew, setShowNew] = useState(false)

  const myBoards = boards.filter(b => b._type === 'owned')
  const sharedBoards = boards.filter(b => b._type === 'shared')

  const handleCreate = async (name) => {
    const ref = await createBoard(name)
    navigate(`/board/${ref.id}`)
  }

  return (
    <aside className="w-48 bg-indigo-50/80 border-r border-indigo-100 p-3 flex-shrink-0 flex flex-col gap-1">
      <button
        onClick={() => setShowNew(true)}
        className="w-full text-left text-xs font-bold text-indigo-400 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-colors mb-1"
      >
        + New Board
      </button>

      <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest px-3 mb-1">
        My Boards
      </p>
      {myBoards.map(b => (
        <button
          key={b.id}
          onClick={() => navigate(`/board/${b.id}`)}
          className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors truncate ${
            boardId === b.id
              ? 'bg-indigo-100 text-indigo-700 font-bold'
              : 'text-slate-500 hover:bg-indigo-50'
          }`}
        >
          📋 {b.name}
        </button>
      ))}

      {sharedBoards.length > 0 && (
        <>
          <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest px-3 mt-3 mb-1">
            Shared
          </p>
          {sharedBoards.map(b => (
            <button
              key={b.id}
              onClick={() => navigate(`/board/${b.id}`)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors truncate ${
                boardId === b.id
                  ? 'bg-indigo-100 text-indigo-700 font-bold'
                  : 'text-slate-500 hover:bg-indigo-50'
              }`}
            >
              🌐 {b.name}
            </button>
          ))}
        </>
      )}

      {showNew && (
        <NewBoardModal onCreate={handleCreate} onClose={() => setShowNew(false)} />
      )}
    </aside>
  )
}
