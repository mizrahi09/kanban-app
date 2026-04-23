import { useEffect, useState } from 'react'
import {
  collection, addDoc, onSnapshot, query, orderBy,
  doc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useComments(boardId, taskId) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])

  useEffect(() => {
    if (!boardId || !taskId) return
    const q = query(
      collection(db, 'boards', boardId, 'tasks', taskId, 'comments'),
      orderBy('createdAt', 'asc')
    )
    return onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [boardId, taskId])

  const addComment = (text) => {
    if (!text?.trim() || !user) return
    return addDoc(
      collection(db, 'boards', boardId, 'tasks', taskId, 'comments'),
      {
        text: text.trim(),
        authorId: user.uid,
        authorEmail: user.email,
        authorPhotoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
      }
    )
  }

  const deleteComment = (commentId, authorId) => {
    if (!user || authorId !== user.uid) return
    return deleteDoc(
      doc(db, 'boards', boardId, 'tasks', taskId, 'comments', commentId)
    )
  }

  return { comments, addComment, deleteComment }
}
