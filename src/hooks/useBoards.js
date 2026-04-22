import { useEffect, useState } from 'react'
import {
  collection, addDoc, onSnapshot, query, where,
  orderBy, doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useBoards() {
  const { user } = useAuth()
  const [boards, setBoards] = useState([])

  useEffect(() => {
    if (!user) return
    // Listen to boards owned by this user AND shared boards
    const ownedQ = query(
      collection(db, 'boards'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const sharedQ = query(
      collection(db, 'boards'),
      where('isShared', '==', true),
      orderBy('createdAt', 'desc')
    )

    const ownedUnsub = onSnapshot(ownedQ, snap => {
      const owned = snap.docs.map(d => ({ id: d.id, ...d.data(), _type: 'owned' }))
      setBoards(prev => {
        const shared = prev.filter(b => b._type === 'shared')
        return [...owned, ...shared]
      })
    })
    const sharedUnsub = onSnapshot(sharedQ, snap => {
      const shared = snap.docs
        .filter(d => d.data().ownerId !== user.uid)
        .map(d => ({ id: d.id, ...d.data(), _type: 'shared' }))
      setBoards(prev => {
        const owned = prev.filter(b => b._type === 'owned')
        return [...owned, ...shared]
      })
    })

    return () => { ownedUnsub(); sharedUnsub() }
  }, [user])

  const createBoard = async (name) => {
    return addDoc(collection(db, 'boards'), {
      name,
      ownerId: user.uid,
      isShared: false,
      createdAt: serverTimestamp(),
    })
  }

  const updateBoard = (boardId, data) =>
    updateDoc(doc(db, 'boards', boardId), data)

  const deleteBoard = (boardId) =>
    deleteDoc(doc(db, 'boards', boardId))

  return { boards, createBoard, updateBoard, deleteBoard }
}
