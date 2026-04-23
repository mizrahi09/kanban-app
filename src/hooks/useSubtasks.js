import { useEffect, useState } from 'react'
import {
  collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useSubtasks(boardId, taskId) {
  const [subtasks, setSubtasks] = useState([])

  useEffect(() => {
    if (!boardId || !taskId) return
    const q = query(
      collection(db, 'boards', boardId, 'tasks', taskId, 'subtasks'),
      orderBy('order', 'asc')
    )
    return onSnapshot(q, snap => {
      setSubtasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [boardId, taskId])

  const addSubtask = (title) => {
    if (!title?.trim()) return
    return addDoc(
      collection(db, 'boards', boardId, 'tasks', taskId, 'subtasks'),
      {
        title: title.trim(),
        completed: false,
        order: subtasks.length,
        createdAt: serverTimestamp(),
      }
    )
  }

  const toggleSubtask = (subtaskId, currentCompleted) => {
    return updateDoc(
      doc(db, 'boards', boardId, 'tasks', taskId, 'subtasks', subtaskId),
      { completed: !currentCompleted }
    )
  }

  const deleteSubtask = (subtaskId) => {
    return deleteDoc(
      doc(db, 'boards', boardId, 'tasks', taskId, 'subtasks', subtaskId)
    )
  }

  return { subtasks, addSubtask, toggleSubtask, deleteSubtask }
}
