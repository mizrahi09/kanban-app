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

  const boardId = boardRef.id
  const colRef = (name, order) =>
    addDoc(collection(db, 'boards', boardId, 'columns'), { name, order, createdAt: serverTimestamp() })

  const [col0, col1, col2] = await Promise.all([
    colRef('To Do', 0),
    colRef('In Progress', 1),
    colRef('Done', 2),
  ])

  const task = (title, columnId, priority, order) =>
    addDoc(collection(db, 'boards', boardId, 'tasks'), {
      title, columnId, priority, order,
      description: '', contentType: 'Deep Dive', dueDate: null,
      boardId, createdBy: userId, createdAt: serverTimestamp(),
    })

  await Promise.all([
    task('Welcome! Click a task to edit it', col0.id, 'Low', 0),
    task('Try dragging tasks between columns', col0.id, 'Medium', 1),
    task('Add your first real task using "+ Add task"', col0.id, 'Low', 2),
    task('This task is in progress', col1.id, 'High', 0),
    task('This task is done ✓', col2.id, 'Medium', 0),
  ])

  return boardId
}
