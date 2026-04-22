import { useEffect, useState } from 'react'
import {
  collection, addDoc, onSnapshot, query, orderBy,
  doc, updateDoc, deleteDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'

export function useTasks(boardId) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!boardId) return
    const q = query(
      collection(db, 'boards', boardId, 'tasks'),
      orderBy('order', 'asc')
    )
    return onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [boardId])

  const createTask = (columnId, data) => {
    const tasksInColumn = tasks.filter(t => t.columnId === columnId)
    return addDoc(collection(db, 'boards', boardId, 'tasks'), {
      title: '',
      description: '',
      contentType: 'Deep Dive',
      priority: 'Medium',
      dueDate: null,
      order: tasksInColumn.length,
      columnId,
      boardId,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      ...data,
    })
  }

  const updateTask = (taskId, data) =>
    updateDoc(doc(db, 'boards', boardId, 'tasks', taskId), data)

  const deleteTask = (taskId) =>
    deleteDoc(doc(db, 'boards', boardId, 'tasks', taskId))

  // Called when a task is dropped into a new column or new position
  const moveTask = async (taskId, newColumnId, newOrder) => {
    const batch = writeBatch(db)
    batch.update(doc(db, 'boards', boardId, 'tasks', taskId), {
      columnId: newColumnId,
      order: newOrder,
    })
    return batch.commit()
  }

  return { tasks, createTask, updateTask, deleteTask, moveTask }
}
