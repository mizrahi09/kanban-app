import { useEffect, useState } from 'react'
import {
  collection, addDoc, onSnapshot, query,
  orderBy, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

export function useColumns(boardId) {
  const [columns, setColumns] = useState([])

  useEffect(() => {
    if (!boardId) return
    const q = query(
      collection(db, 'boards', boardId, 'columns'),
      orderBy('order', 'asc')
    )
    return onSnapshot(q, snap => {
      setColumns(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [boardId])

  const createColumn = (name) => {
    const order = columns.length
    return addDoc(collection(db, 'boards', boardId, 'columns'), {
      name,
      order,
      color: null,
      createdAt: serverTimestamp(),
    })
  }

  const updateColumn = (columnId, data) =>
    updateDoc(doc(db, 'boards', boardId, 'columns', columnId), data)

  const deleteColumn = (columnId) =>
    deleteDoc(doc(db, 'boards', boardId, 'columns', columnId))

  const reorderColumns = async (reordered) => {
    const batch = writeBatch(db)
    reordered.forEach((col, i) => {
      batch.update(doc(db, 'boards', boardId, 'columns', col.id), { order: i })
    })
    return batch.commit()
  }

  return { columns, createColumn, updateColumn, deleteColumn, reorderColumns }
}
