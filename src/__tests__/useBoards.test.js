import { vi } from 'vitest'

// The hook's public API: createBoard returns an object with an id field
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'board-123' })),
  onSnapshot: vi.fn(() => () => {}),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  serverTimestamp: vi.fn(() => 'timestamp'),
}))
vi.mock('../firebase', () => ({ db: {} }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { uid: 'user-1' } }) }))

import { addDoc } from 'firebase/firestore'
import { renderHook, act } from '@testing-library/react'
import { useBoards } from '../hooks/useBoards'

test('createBoard calls addDoc with correct shape', async () => {
  const { result } = renderHook(() => useBoards())
  await act(async () => {
    await result.current.createBoard('My Board')
  })
  expect(addDoc).toHaveBeenCalledWith(
    undefined, // collection ref (mocked)
    expect.objectContaining({ name: 'My Board', ownerId: 'user-1', isShared: false })
  )
})
