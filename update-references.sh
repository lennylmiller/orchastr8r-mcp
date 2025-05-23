#!/bin/bash

# Script to recursively find and replace mcp-github-projects with orchestr8r-mcp in JSON files

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Starting directory (current directory by default)
SEARCH_DIR="${1:-.}"

echo -e "${YELLOW}Searching for JSON files containing 'mcp-github-projects'...${NC}"

# Find all JSON files containing the old name
files_found=$(find "$SEARCH_DIR" -type f -name "*.json" -exec grep -l "mcp-github-projects" {} \; 2>/dev/null)

if [ -z "$files_found" ]; then
    echo -e "${GREEN}No JSON files found containing 'mcp-github-projects'${NC}"
    exit 0
fi

echo -e "${YELLOW}Found the following files:${NC}"
echo "$files_found"
echo

# Ask for confirmation
read -p "Do you want to replace 'mcp-github-projects' with 'orchestr8r-mcp' in these files? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Operation cancelled${NC}"
    exit 1
fi

# Create backup directory
backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"

# Process each file
while IFS= read -r file; do
    echo -e "${YELLOW}Processing: $file${NC}"
    
    # Create backup
    cp "$file" "$backup_dir/$(basename "$file").bak"
    
    # Perform replacement
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' 's/mcp-github-projects/orchestr8r-mcp/g' "$file"
    else
        # Linux
        sed -i 's/mcp-github-projects/orchestr8r-mcp/g' "$file"
    fi
    
    echo -e "${GREEN}✓ Updated: $file${NC}"
done <<< "$files_found"

echo
echo -e "${GREEN}All files have been updated!${NC}"
echo -e "${YELLOW}Backups saved in: $backup_dir${NC}"

# Show a summary of changes
echo
echo -e "${YELLOW}Summary of changes:${NC}"
while IFS= read -r file; do
    changes=$(grep -n "orchestr8r-mcp" "$file" 2>/dev/null | head -5)
    if [ ! -z "$changes" ]; then
        echo -e "${GREEN}$file:${NC}"
        echo "$changes"
        echo
    fi
done <<< "$files_found"