import { describe, it, expect } from 'vitest';
import { sortTasks, groupTasks } from '../utils/sortAndGroup.js';

const makeTasks = (overrides = []) =>
  overrides.map((o, i) => ({
    id: `t${i}`,
    title: `Task ${i}`,
    description: '',
    contentType: 'News',
    priority: 'Medium',
    dueDate: null,
    columnId: 'col1',
    order: i,
    createdAt: null,
    ...o,
  }));

describe('sortTasks', () => {
  it('sorts by priority: High before Medium before Low', () => {
    const tasks = makeTasks([
      { priority: 'Low' },
      { priority: 'High' },
      { priority: 'Medium' },
    ]);
    const result = sortTasks(tasks, 'priority');
    expect(result.map((t) => t.priority)).toEqual(['High', 'Medium', 'Low']);
  });

  it('sorts by dueDate ascending, nulls last', () => {
    const tasks = makeTasks([
      { dueDate: '2024-03-01' },
      { dueDate: null },
      { dueDate: '2024-01-15' },
      { dueDate: null },
      { dueDate: '2024-02-10' },
    ]);
    const result = sortTasks(tasks, 'dueDate');
    expect(result.map((t) => t.dueDate)).toEqual([
      '2024-01-15',
      '2024-02-10',
      '2024-03-01',
      null,
      null,
    ]);
  });

  it('sorts by title alphabetically (case-insensitive)', () => {
    const tasks = makeTasks([
      { title: 'Zebra' },
      { title: 'apple' },
      { title: 'Mango' },
    ]);
    const result = sortTasks(tasks, 'title');
    expect(result.map((t) => t.title)).toEqual(['apple', 'Mango', 'Zebra']);
  });

  it('does not mutate the original array', () => {
    const tasks = makeTasks([
      { priority: 'Low' },
      { priority: 'High' },
    ]);
    const original = [...tasks];
    sortTasks(tasks, 'priority');
    expect(tasks[0].priority).toBe(original[0].priority);
    expect(tasks[1].priority).toBe(original[1].priority);
  });

  it('sorts by created ascending using toMillis(), missing createdAt treated as 0', () => {
    const tasks = makeTasks([
      { createdAt: { toMillis: () => 3000 } },
      { createdAt: { toMillis: () => 1000 } },
      { createdAt: null },
      { createdAt: { toMillis: () => 2000 } },
    ]);
    const result = sortTasks(tasks, 'created');
    expect(result.map((t) => t.createdAt?.toMillis?.() ?? 0)).toEqual([
      0, 1000, 2000, 3000,
    ]);
  });

  it('returns tasks unchanged for unknown sortBy', () => {
    const tasks = makeTasks([{ title: 'Z' }, { title: 'A' }]);
    const result = sortTasks(tasks, 'unknown');
    expect(result).toBe(tasks);
  });

  it('returns tasks unchanged when sortBy is undefined', () => {
    const tasks = makeTasks([{ title: 'Z' }, { title: 'A' }]);
    const result = sortTasks(tasks, undefined);
    expect(result).toBe(tasks);
  });
});

describe('groupTasks', () => {
  const columns = [
    { id: 'col1', name: 'Backlog' },
    { id: 'col2', name: 'In Progress' },
    { id: 'col3', name: 'Done' },
  ];

  it('groups by column, includes empty columns, preserves column order', () => {
    const tasks = makeTasks([
      { columnId: 'col3', title: 'T1' },
      { columnId: 'col1', title: 'T2' },
    ]);
    const result = groupTasks(tasks, columns, 'column');
    expect(result).toHaveLength(3);
    expect(result[0].key).toBe('col1');
    expect(result[0].label).toBe('Backlog');
    expect(result[0].tasks).toHaveLength(1);
    expect(result[1].key).toBe('col2');
    expect(result[1].tasks).toHaveLength(0);
    expect(result[2].key).toBe('col3');
    expect(result[2].tasks).toHaveLength(1);
  });

  it('groups by priority in High/Medium/Low order, skips empty groups', () => {
    const tasks = makeTasks([
      { priority: 'Low', title: 'T1' },
      { priority: 'High', title: 'T2' },
      { priority: 'High', title: 'T3' },
    ]);
    const result = groupTasks(tasks, columns, 'priority');
    expect(result).toHaveLength(2);
    expect(result[0].key).toBe('High');
    expect(result[0].tasks).toHaveLength(2);
    expect(result[1].key).toBe('Low');
    expect(result[1].tasks).toHaveLength(1);
  });

  it('groups by contentType alphabetically, only includes non-empty groups', () => {
    const tasks = makeTasks([
      { contentType: 'How-To' },
      { contentType: 'Deep Dive' },
      { contentType: 'How-To' },
      { contentType: 'News' },
    ]);
    const result = groupTasks(tasks, columns, 'contentType');
    expect(result.map((g) => g.key)).toEqual(['Deep Dive', 'How-To', 'News']);
    expect(result[1].tasks).toHaveLength(2);
  });

  it('returns single all group for unknown groupBy', () => {
    const tasks = makeTasks([{ title: 'T1' }, { title: 'T2' }]);
    const result = groupTasks(tasks, columns, 'unknown');
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('all');
    expect(result[0].label).toBe('All Tasks');
    expect(result[0].tasks).toHaveLength(2);
  });

  it('returns single all group when groupBy is undefined', () => {
    const tasks = makeTasks([{ title: 'T1' }]);
    const result = groupTasks(tasks, columns, undefined);
    expect(result[0].key).toBe('all');
    expect(result[0].tasks).toHaveLength(1);
  });
});
