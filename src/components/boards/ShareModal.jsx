import { useState, useEffect } from 'react'
import {
  collection, doc, getDoc, getDocs, query,
  updateDoc, where, arrayUnion, arrayRemove,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../context/AuthContext'

function Avatar({ profile }) {
  if (profile?.photoURL) {
    return <img src={profile.photoURL} alt={profile.displayName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
      {(profile?.displayName || profile?.email || '?')[0].toUpperCase()}
    </div>
  )
}

function MemberRow({ uid, badge, onRemove }) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'users', uid)).then(d => { if (d.exists()) setProfile(d.data()) })
  }, [uid])

  if (!profile) return (
    <div className="flex items-center gap-3 py-1.5 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="h-3 bg-gray-100 rounded w-32" />
    </div>
  )

  return (
    <div className="flex items-center gap-3 py-1.5">
      <Avatar profile={profile} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{profile.displayName || profile.email}</p>
        <p className="text-xs text-gray-400 truncate">{profile.email}</p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
        badge === 'Owner' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'
      }`}>{badge}</span>
      {onRemove && (
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors ml-1 flex-shrink-0" title="Remove member">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function ShareModal({ board, onClose }) {
  const { user } = useAuth()
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState(null)  // { type: 'error'|'success', msg }
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)

  const isOwner    = user?.uid === board.ownerId
  const members    = board.members ?? []
  const boardUrl   = `${window.location.origin}/board/${board.id}`

  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setLoading(true)
    setStatus(null)
    try {
      const snap = await getDocs(query(collection(db, 'users'), where('email', '==', trimmed)))
      if (snap.empty) {
        setStatus({ type: 'error', msg: `No account found for "${trimmed}". They must sign in to the app at least once first.` })
        return
      }
      const invited = snap.docs[0].data()
      if (invited.uid === board.ownerId) {
        setStatus({ type: 'error', msg: 'That person already owns this board.' })
        return
      }
      if (members.includes(invited.uid)) {
        setStatus({ type: 'error', msg: 'That person is already a member.' })
        return
      }
      await updateDoc(doc(db, 'boards', board.id), { members: arrayUnion(invited.uid) })
      setStatus({ type: 'success', msg: `${invited.email} has been added to the board!` })
      setEmail('')
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', msg: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (uid) => {
    await updateDoc(doc(db, 'boards', board.id), { members: arrayRemove(uid) })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(boardUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-800">Share "{board.name}"</h2>
            <p className="text-xs text-gray-400 mt-0.5">Invite teammates by their email address</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Invite input — only owner can invite */}
        {isOwner ? (
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setStatus(null) }}
              onKeyDown={e => e.key === 'Enter' && handleInvite()}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
            />
            <button
              onClick={handleInvite}
              disabled={loading || !email.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {loading ? 'Adding…' : 'Add member'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-3 bg-gray-50 rounded-lg px-3 py-2">Only the board owner can invite members.</p>
        )}

        {/* Status message */}
        {status && (
          <p className={`text-xs mb-3 px-3 py-2 rounded-lg ${
            status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
          }`}>{status.msg}</p>
        )}

        {/* Members list */}
        <div className="border border-gray-100 rounded-xl px-4 py-1 mb-4 divide-y divide-gray-50">
          <MemberRow uid={board.ownerId} badge="Owner" />
          {members.map(uid => (
            <MemberRow
              key={uid}
              uid={uid}
              badge="Member"
              onRemove={isOwner ? () => handleRemove(uid) : undefined}
            />
          ))}
          {members.length === 0 && (
            <p className="text-xs text-gray-300 py-3 text-center">No members yet. Invite someone above.</p>
          )}
        </div>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {copied ? 'Link copied!' : 'Copy board link'}
        </button>

      </div>
    </div>
  )
}
