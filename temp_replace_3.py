with open('src/pages/DashboardNew.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

with open('temp_ui.txt', 'r', encoding='utf-8') as f:
    replacement_str = f.read()

start_sig = '        <div className="border border-gray-300 bg-white p-6">\n          <h3 className="mb-4 text-xl font-semibold text-gray-900">All Submissions</h3>'
start_idx = text.find(start_sig)

if start_idx == -1:
    print('Failed to find start signature')
    exit(1)

# we want to replace from start_idx up to the '</div>' before '    );\n  }\n\n  // Admin view'
# let's just find the end signature:
end_sig = '      </div>\n    );\n  }\n\n  // Admin view'
end_idx = text.find(end_sig, start_idx)

if end_idx == -1:
    print('Failed to find end signature')
    exit(1)

# The block from start_idx to the parent close div
# The parent div close is '      </div>\n' right before end_sig
parent_div_close = text.rfind('      </div>\n', start_idx, end_idx)

if parent_div_close == -1:
    print('Failed to find parent div close')
    exit(1)

new_text = text[:start_idx] + replacement_str + '\n' + text[parent_div_close:]

with open('src/pages/DashboardNew.tsx', 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Success')
