import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useBoards } from '../../hooks/useBoards'
import NewBoardModal from '../boards/NewBoardModal'

export default function Sidebar() {
  const { boards, createBoard, deleteBoard } = useBoards()
  const { boardId } = useParams()
  const navigate = useNavigate()
  const [showNew, setShowNew] = useState(false)

  const myBoards = boards.filter(b => b._type === 'owned')
  const sharedBoards = boards.filter(b => b._type === 'shared')

  const handleCreate = async (name) => {
    const ref = await createBoard(name)
    navigate(`/board/${ref.id}`)
  }

  const handleDelete = async (id) => {
    await deleteBoard(id)
    if (boardId === id) {
      const remaining = myBoards.filter(b => b.id !== id)
      navigate(remaining.length > 0 ? `/board/${remaining[0].id}` : '/')
    }
  }

  const BoardItem = ({ board, icon }) => (
    <div className={`group flex items-center rounded-lg transition-colors ${
      boardId === board.id ? 'bg-indigo-50' : 'hover:bg-gray-100'
    }`}>
      <button
        onClick={() => navigate(`/board/${board.id}`)}
        className={`flex-1 text-left text-sm px-3 py-2 truncate ${
          boardId === board.id ? 'text-indigo-700 font-semibold' : 'text-gray-600'
        }`}
      >
        {icon} {board.name}
      </button>
      {icon === '📋' && (
        <button
          onClick={() => handleDelete(board.id)}
          className="opacity-0 group-hover:opacity-100 pr-2 text-gray-300 hover:text-red-400 transition-all text-xs"
          title="Delete board"
        >
          🗑
        </button>
      )}
    </div>
  )

  return (
    <aside className="w-52 bg-white border-r border-gray-100 p-3 flex-shrink-0 flex flex-col gap-0.5">
      <button
        onClick={() => setShowNew(true)}
        className="w-full text-left text-sm text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors mb-2 flex items-center gap-2"
      >
        <span className="text-base leading-none font-light">+</span>
        <span>New Board</span>
      </button>

      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">
        My Boards
      </p>
      {myBoards.map(b => <BoardItem key={b.id} board={b} icon="📋" />)}

      {sharedBoards.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mt-3 mb-1">
            Shared
          </p>
          {sharedBoards.map(b => <BoardItem key={b.id} board={b} icon="🌐" />)}
        </>
      )}

      {showNew && (
        <NewBoardModal onCreate={handleCreate} onClose={() => setShowNew(false)} />
      )}
    </aside>
  )
}
