const SELECT_CLASS =
  'border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300'

const LABEL_CLASS = 'text-xs text-slate-500 mr-1'

export default function BoardToolbar({
  groupBy,
  sortBy,
  filterPriority,
  filterContentType,
  searchQuery,
  onGroupByChange,
  onSortByChange,
  onFilterPriorityChange,
  onFilterContentTypeChange,
  onSearchQueryChange,
  onOpenSettings,
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap py-3 px-1">
      {/* Search */}
      <input
        type="text"
        placeholder="Search tasks…"
        value={searchQuery}
        onChange={e => onSearchQueryChange(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48"
      />

      {/* Group by */}
      <label className="flex items-center">
        <span className={LABEL_CLASS}>Group</span>
        <select
          value={groupBy}
          onChange={e => onGroupByChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">None</option>
          <option value="column">Column</option>
          <option value="priority">Priority</option>
          <option value="contentType">Content Type</option>
        </select>
      </label>

      {/* Sort by */}
      <label className="flex items-center">
        <span className={LABEL_CLASS}>Sort</span>
        <select
          value={sortBy}
          onChange={e => onSortByChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">Default</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
          <option value="title">Title</option>
          <option value="created">Created</option>
        </select>
      </label>

      {/* Filter Priority */}
      <label className="flex items-center">
        <span className={LABEL_CLASS}>Priority</span>
        <select
          value={filterPriority}
          onChange={e => onFilterPriorityChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </label>

      {/* Filter Content Type */}
      <label className="flex items-center">
        <span className={LABEL_CLASS}>Type</span>
        <select
          value={filterContentType}
          onChange={e => onFilterContentTypeChange(e.target.value)}
          className={SELECT_CLASS}
        >
          <option value="">All</option>
          <option value="Deep Dive">Deep Dive</option>
          <option value="Quick Tip">Quick Tip</option>
          <option value="News">News</option>
          <option value="How-To">How-To</option>
          <option value="Opinion">Opinion</option>
          <option value="AI Adoption Article">AI Adoption Article</option>
        </select>
      </label>

      {/* Spacer */}
      <span className="ml-auto" />

      {/* Settings button */}
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-indigo-300 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
        Settings
      </button>
    </div>
  )
}
