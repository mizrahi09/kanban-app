const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

export function sortTasks(tasks, sortBy) {
  if (!sortBy) return tasks;

  const arr = [...tasks];

  if (sortBy === 'priority') {
    return arr.sort((a, b) => {
      const pa = PRIORITY_ORDER[a.priority] ?? 3;
      const pb = PRIORITY_ORDER[b.priority] ?? 3;
      return pa - pb;
    });
  }

  if (sortBy === 'dueDate') {
    return arr.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
    });
  }

  if (sortBy === 'title') {
    return arr.sort((a, b) =>
      (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase())
    );
  }

  if (sortBy === 'created') {
    return arr.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return ta - tb;
    });
  }

  return tasks;
}

export function groupTasks(tasks, columns, groupBy) {
  if (groupBy === 'column') {
    return columns.map((col) => ({
      key: col.id,
      label: col.name,
      tasks: tasks.filter((t) => t.columnId === col.id),
    }));
  }

  if (groupBy === 'priority') {
    return ['High', 'Medium', 'Low']
      .map((p) => ({
        key: p,
        label: p,
        tasks: tasks.filter((t) => t.priority === p),
      }))
      .filter((g) => g.tasks.length > 0);
  }

  if (groupBy === 'contentType') {
    const map = new Map();
    for (const task of tasks) {
      const ct = task.contentType;
      if (!map.has(ct)) map.set(ct, []);
      map.get(ct).push(task);
    }
    return [...map.keys()]
      .sort((a, b) => a.localeCompare(b))
      .map((ct) => ({ key: ct, label: ct, tasks: map.get(ct) }));
  }

  return [{ key: 'all', label: 'All Tasks', tasks }];
}
