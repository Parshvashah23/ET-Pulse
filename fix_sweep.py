import os
import glob

# 1. Sweep agent files for AI Restrictiveness
# Changing "Economic Times" to generalized "Top-Tier Publication"
agent_files = glob.glob("agents/*.py")
for file in agent_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = content.replace("for the Economic Times", "for a Top-Tier Publication")
    content = content.replace("ET (Economic Times)", "a Top-Tier Publication")
    
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

# 2. Sweep Frontend CSS Hardcodings for Dark Mode
frontend_patterns = [
    "frontend/app/**/*.tsx",
    "frontend/components/**/*.tsx"
]

files_to_check = []
for pattern in frontend_patterns:
    files_to_check.extend(glob.glob(pattern, recursive=True))

replacements = {
    "bg-white": "bg-[var(--surface)]",
    "border-et-gray-border": "border-[var(--border)]",
    "text-et-ink-light": "text-[var(--text-secondary)]",
    "text-et-ink": "text-[var(--text-primary)]"
}

modified_count = 0
for file in files_to_check:
    try:
        with open(file, "r", encoding="utf-8") as f:
            content = f.read()
        
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
            
        if content != original_content:
            with open(file, "w", encoding="utf-8") as f:
                f.write(content)
            modified_count += 1
    except Exception as e:
        print(f"Failed to read/write {file}: {e}")

print(f"Sweep completed successfully. Modified {modified_count} frontend files.")
