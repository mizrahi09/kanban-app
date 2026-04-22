import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function initializeDefaultBoard(userId) {
  const boardRef = await addDoc(collection(db, 'boards'), {
    name: 'My Board',
    ownerId: userId,
    isShared: false,
    sharedWith: [],
    createdAt: serverTimestamp(),
  })

  const columnNames = ['To Do', 'In Progress', 'Done']
  for (let i = 0; i < columnNames.length; i++) {
    await addDoc(collection(db, 'boards', boardRef.id, 'columns'), {
      name: columnNames[i],
      order: i,
      createdAt: serverTimestamp(),
    })
  }

  return boardRef.id
}
