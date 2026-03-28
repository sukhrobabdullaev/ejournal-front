import re

file_path = 'd:/SaaS/ejournal/ejournal-front/src/pages/DashboardNew.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the start and end of the "All Submissions" block in the EditorAdminSection
start_pattern = r'<h3 className="mb-4 text-xl font-semibold text-gray-900">All Submissions</h3>'
end_pattern = r'View Submission Details\s*</Link>\s*</div>\s*\)\)}\s*</div>\s*\)\)}\s*</div>'

start_idx = content.find('<h3 className="mb-4 text-xl font-semibold text-gray-900">All Submissions</h3>')

if start_idx != -1:
    # Find the enclosing div
    div_start = content.rfind('<div className="border border-gray-300 bg-white p-6">', 0, start_idx)
    
    # We need to find the matching closing div for div_start.
    # It ends right before "      </div>\n    );\n  }"
    
    end_idx = content.find('    );\n  }\n\n  // Admin view', div_start)
    if end_idx != -1:
        # The block to replace is from div_start to end_idx - 13 (to exclude the '      </div>\n' which belongs to the parent)
        # Actually it's simpler:
        
        replacement_str = """        <div className="border border-slate-200 bg-white p-6 rounded-xl shadow-[0_4px_24px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-[#0B1C4D]">All Submissions</h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search input */}
              <div className="relative w-full sm:w-64 group">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563EB] transition-colors" />
                <input
                  type="text"
                  placeholder="Search title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] bg-slate-50 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="relative w-full sm:w-48 group">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563EB] transition-colors" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2563EB]/10 focus:border-[#2563EB] bg-slate-50 appearance-none cursor-pointer group-hover:bg-white transition-all"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map((st) => (
                    <option key={st} value={st}>
                      {getStatusLabel(st)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No results found matching your criteria</p>
              {(searchTerm || filterStatus !== 'all') && (
                <button 
                  onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                  className="mt-4 text-[#2563EB] text-sm font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {currentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="relative group border border-slate-100 p-5 rounded-xl bg-white transition-all duration-300 hover:border-[#93C5FD] hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(submission.status)}`}>
                            {getStatusLabel(submission.status)}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-[#0B1C4D] mb-2 leading-tight group-hover:text-[#2563EB] transition-colors truncate">
                          {submission.title || 'Untitled Submission'}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-700">{(submission as any).profiles?.full_name || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" />
                            <span>
                              {submission.created_at
                                ? new Date(submission.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/editor/submissions/${submission.id}`}
                        className="sm:self-center inline-flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold text-[#0B1C4D] hover:bg-[#EFF6FF] hover:border-[#93C5FD] hover:text-[#2563EB] transition-all"
                      >
                        <Eye size={16} className="text-slate-400 group-hover:text-[#2563EB]" />
                        Details
                      </Link>
                    </div>
                    {submission.abstract && (
                      <div className="mt-4 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {submission.abstract}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-500 font-medium">
                    Showing <span className="text-[#0B1C4D] font-bold">{currentSubmissions.length}</span> of <span className="text-[#0B1C4D] font-bold">{filteredSubmissions.length}</span> results
                  </p>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                        const isCurrent = safePage === p;
                        const isSibling = Math.abs(p - safePage) <= 1;
                        const isEdge = p === 1 || p === totalPages;
                        
                        if (!isSibling && !isEdge) {
                          if (p === 2 || p === totalPages - 1) return <span key={`dots-${p}`} className="px-1 text-slate-300">...</span>;
                          return null;
                        }

                        return (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                              isCurrent 
                                ? 'bg-[#2563EB] text-white shadow-sm shadow-[#2563EB]/20 border border-[#2563EB]' 
                                : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>"""
        
        # We need to find the correct end of the previous div.
        parent_div_close = content.rfind('      </div>\n    );\n  }\n', div_start, end_idx + 30)
        
        block_to_replace = content[div_start:parent_div_close]
        
        new_content = content[:div_start] + replacement_str + '\n' + content[parent_div_close:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Success")
    else:
        print("End idx not found")
else:
    print("Start idx not found")
