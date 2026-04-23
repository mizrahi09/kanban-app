import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useBoards } from '../../hooks/useBoards'
import NewBoardModal from '../boards/NewBoardModal'
import ShareModal from '../boards/ShareModal'

const COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#22c55e',
  '#eab308', '#f97316', '#ef4444', '#ec4899',
  '#8b5cf6', '#14b8a6',
]
const ICONS = ['📋', '📌', '🎯', '🚀', '💡', '⭐', '🔥', '📊', '🗂️', '💼', '🏆', '✅', '🎨', '🌟', '🧩']

// ── Shared context menu ──
function ContextMenu({ x, y, onClose, items }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const left = Math.min(x, window.innerWidth - 224)
  const top  = Math.min(y, window.innerHeight - 300)

  return (
    <div ref={ref} className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 w-56" style={{ left, top }}>
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1 border-t border-gray-100" />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose() }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors text-left ${
              item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex-shrink-0 text-gray-400 w-4 h-4">{item.icon}</span>
            {item.label}
          </button>
        )
      )}
    </div>
  )
}

// ── Color & Icon picker ──
function ColorIconPicker({ board, position, onClose, onUpdate }) {
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const left = Math.min(position.x + 216, window.innerWidth - 232)
  const top  = Math.min(position.y, window.innerHeight - 320)

  return (
    <div ref={ref} className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-56" style={{ left, top }}>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Color</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {COLORS.map(color => (
          <button
            key={color}
            onClick={() => onUpdate({ color })}
            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${board.color === color ? 'border-gray-500 scale-110' : 'border-transparent'}`}
            style={{ background: color }}
          />
        ))}
        <button
          onClick={() => onUpdate({ color: null })}
          className="w-6 h-6 rounded-full border-2 border-dashed border-gray-200 hover:border-gray-400 flex items-center justify-center text-gray-400 text-xs transition-colors"
        >✕</button>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Icon</p>
      <div className="flex flex-wrap gap-1">
        {ICONS.map(icon => (
          <button
            key={icon}
            onClick={() => onUpdate({ icon })}
            className={`w-7 h-7 rounded-lg text-base flex items-center justify-center hover:bg-gray-100 transition-colors ${board.icon === icon ? 'bg-indigo-100' : ''}`}
          >{icon}</button>
        ))}
      </div>
    </div>
  )
}

// ── SVG icon helpers ──
const Icon = {
  share: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>,
  newTab: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  link: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  palette: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
  pencil: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  trash: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
}

export default function Sidebar() {
  const { boards, createBoard, deleteBoard, updateBoard } = useBoards()
  const { boardId } = useParams()
  const navigate = useNavigate()
  const [showNew, setShowNew]           = useState(false)
  const [menu, setMenu]                 = useState(null)   // { board, x, y }
  const [renamingId, setRenamingId]     = useState(null)
  const [renameInput, setRenameInput]   = useState('')
  const [colorPicker, setColorPicker]   = useState(null)  // { board, x, y }
  const [shareBoard, setShareBoard]     = useState(null)  // board being shared

  const myBoards     = boards.filter(b => b._type === 'owned')
  const sharedBoards = boards.filter(b => b._type === 'shared')

  const handleCreate = async (name) => {
    const ref = await createBoard(name)
    // Seed default columns in one batch write
    const batch = writeBatch(db)
    ;['To Do', 'In Progress', 'Done'].forEach((colName, i) => {
      const colRef = doc(collection(db, 'boards', ref.id, 'columns'))
      batch.set(colRef, { name: colName, order: i, color: null, createdAt: serverTimestamp() })
    })
    await batch.commit()
    navigate(`/board/${ref.id}`)
  }

  const handleDelete = async (id) => {
    await deleteBoard(id)
    if (boardId === id) {
      const remaining = myBoards.filter(b => b.id !== id)
      navigate(remaining.length > 0 ? `/board/${remaining[0].id}` : '/')
    }
  }

  const commitRename = async (board) => {
    if (renameInput.trim() && renameInput.trim() !== board.name) {
      await updateBoard(board.id, { name: renameInput.trim() })
    }
    setRenamingId(null)
  }

  const buildMenuItems = (board, menuPos) => {
    const boardUrl = `${window.location.origin}/board/${board.id}`
    return [
      { icon: Icon.share,   label: 'Share project',    action: () => setShareBoard(board) },
      { icon: Icon.newTab,  label: 'Open in new tab',  action: () => window.open(boardUrl, '_blank') },
      { icon: Icon.link,    label: 'Copy link',        action: () => navigator.clipboard.writeText(boardUrl) },
      { icon: Icon.palette, label: 'Set color & icon', action: () => setColorPicker({ board, x: menuPos.x, y: menuPos.y }) },
      { icon: Icon.pencil,  label: 'Rename',           action: () => { setRenamingId(board.id); setRenameInput(board.name) } },
      { divider: true },
      { icon: Icon.trash,   label: 'Delete',           action: () => handleDelete(board.id), danger: true },
    ]
  }

  const BoardItem = ({ board }) => {
    const isActive   = boardId === board.id
    const isRenaming = renamingId === board.id

    return (
      <div
        onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setMenu({ board, x: e.clientX, y: e.clientY }) }}
        className={`group flex items-center rounded-lg transition-colors ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-100'}`}
      >
        {/* Color indicator strip */}
        {board.color && (
          <div className="w-1 h-5 rounded-full ml-2 flex-shrink-0" style={{ background: board.color }} />
        )}

        <button
          onClick={() => navigate(`/board/${board.id}`)}
          className={`flex-1 text-left text-sm px-3 py-2 flex items-center gap-1.5 min-w-0 ${isActive ? 'text-indigo-700 font-semibold' : 'text-gray-600'}`}
        >
          <span className="flex-shrink-0 text-base leading-none">{board.icon || '📋'}</span>
          {isRenaming ? (
            <input
              autoFocus
              value={renameInput}
              onChange={e => setRenameInput(e.target.value)}
              onBlur={() => commitRename(board)}
              onKeyDown={e => {
                if (e.key === 'Enter')  commitRename(board)
                if (e.key === 'Escape') setRenamingId(null)
              }}
              onClick={e => e.stopPropagation()}
              className="flex-1 min-w-0 bg-white border border-indigo-300 rounded px-1.5 py-0.5 text-sm text-gray-800 outline-none focus:ring-1 focus:ring-indigo-400"
            />
          ) : (
            <span className="truncate">{board.name}</span>
          )}
        </button>
      </div>
    )
  }

  return (
    <aside className="w-52 bg-white border-r border-gray-100 p-3 flex-shrink-0 flex flex-col gap-0.5">
      <button
        onClick={() => setShowNew(true)}
        className="w-full text-left text-sm text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors mb-2 flex items-center gap-2"
      >
        <span className="text-base leading-none font-light">+</span>
        <span>New Board</span>
      </button>

      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">My Boards</p>
      {myBoards.map(b => <BoardItem key={b.id} board={b} />)}

      {sharedBoards.length > 0 && (
        <>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mt-3 mb-1">Shared</p>
          {sharedBoards.map(b => <BoardItem key={b.id} board={b} />)}
        </>
      )}

      {showNew && <NewBoardModal onCreate={handleCreate} onClose={() => setShowNew(false)} />}

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={buildMenuItems(menu.board, { x: menu.x, y: menu.y })}
        />
      )}

      {shareBoard && (
        <ShareModal
          board={boards.find(b => b.id === shareBoard.id) ?? shareBoard}
          onClose={() => setShareBoard(null)}
        />
      )}

      {colorPicker && (
        <ColorIconPicker
          board={colorPicker.board}
          position={colorPicker}
          onClose={() => setColorPicker(null)}
          onUpdate={(updates) => {
            updateBoard(colorPicker.board.id, updates)
            setColorPicker(prev => ({ ...prev, board: { ...prev.board, ...updates } }))
          }}
        />
      )}
    </aside>
  )
}
