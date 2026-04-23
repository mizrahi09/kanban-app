import { useEffect, useState } from 'react'
import {
  collection, addDoc, onSnapshot, query, where,
  doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useBoards() {
  const { user } = useAuth()
  const [boards, setBoards] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user) return
    // Listen to boards owned by this user AND shared boards
    const ownedQ = query(
      collection(db, 'boards'),
      where('ownerId', '==', user.uid)
    )
    const sharedQ = query(
      collection(db, 'boards'),
      where('members', 'array-contains', user.uid)
    )

    const sort = (list) => [...list].sort((a, b) =>
      (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
    )

    const ownedUnsub = onSnapshot(ownedQ, snap => {
      const owned = snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'owned' }))
      setBoards(prev => {
        const shared = prev.filter(b => b._type === 'shared')
        return sort([...owned, ...shared])
      })
      setReady(true)
    }, err => console.error('boards snapshot error:', err))

    const sharedUnsub = onSnapshot(sharedQ, snap => {
      const shared = snap.docs
        .filter(d => d.data().ownerId !== user.uid)
        .map(d => ({ id: d.id, ...d.data(), _type: 'shared' }))
      setBoards(prev => {
        const owned = prev.filter(b => b._type === 'owned')
        return sort([...owned, ...shared])
      })
    }, err => console.error('shared boards snapshot error:', err))

    return () => { ownedUnsub(); sharedUnsub() }
  }, [user])

  const createBoard = async (name) => {
    if (!user) throw new Error('Not authenticated')
    return addDoc(collection(db, 'boards'), {
      name,
      ownerId: user.uid,
      members: [],
      isShared: false,
      createdAt: serverTimestamp(),
    })
  }

  const updateBoard = (boardId, data) =>
    updateDoc(doc(db, 'boards', boardId), data)

  const deleteBoard = (boardId) =>
    deleteDoc(doc(db, 'boards', boardId))

  return { boards, ready, createBoard, updateBoard, deleteBoard }
}
