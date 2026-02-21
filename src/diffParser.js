/**
 * Diff Parser - Parses git diff output into structured data
 * Handles unified diff format and extracts file-level changes
 */

class DiffParser {
  constructor() {
    this.filePattern = /^diff --git a\/(.+?) b\/(.+?)$/;
    this.newFilePattern = /^\+\+\+ b\/(.+?)$/;
    this.deletedFilePattern = /^--- a\/(.+?)$/;
    this.hunkHeaderPattern = /^@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@/;
  }

  /**
   * Parse a git diff string into structured data
   * @param {string} diffString - The git diff output
   * @returns {Object} Parsed diff with files array
   */
  parse(diffString) {
    if (!diffString || typeof diffString !== 'string') {
      return { files: [] };
    }

    const lines = diffString.split('\n');
    const files = [];
    let currentFile = null;
    let currentHunk = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for file header (diff --git)
      const fileMatch = line.match(this.filePattern);
      if (fileMatch) {
        if (currentFile) {
          files.push(currentFile);
        }
        currentFile = {
          oldPath: fileMatch[1],
          newPath: fileMatch[2],
          status: this._determineFileStatus(lines, i),
          hunks: [],
          additions: 0,
          deletions: 0,
          content: ''
        };
        continue;
      }

      // Check for new file marker (+++ b/)
      if (!currentFile && line.startsWith('+++ b/')) {
        const newFileMatch = line.match(this.newFilePattern);
        if (newFileMatch) {
          currentFile = {
            oldPath: '/dev/null',
            newPath: newFileMatch[1],
            status: 'added',
            hunks: [],
            additions: 0,
            deletions: 0,
            content: ''
          };
        }
        continue;
      }

      // Check for deleted file marker (--- a/)
      if (!currentFile && line.startsWith('--- a/') && i + 1 < lines.length && lines[i + 1].startsWith('+++ /dev/null')) {
        const deletedFileMatch = line.match(this.deletedFilePattern);
        if (deletedFileMatch) {
          currentFile = {
            oldPath: deletedFileMatch[1],
            newPath: '/dev/null',
            status: 'deleted',
            hunks: [],
            additions: 0,
            deletions: 0,
            content: ''
          };
        }
        continue;
      }

      if (!currentFile) continue;

      // Check for hunk header (@@ -x,y +a,b @@)
      const hunkMatch = line.match(this.hunkHeaderPattern);
      if (hunkMatch) {
        currentHunk = {
          oldStart: parseInt(hunkMatch[1]),
          oldLines: hunkMatch[2] ? parseInt(hunkMatch[2]) : 1,
          newStart: parseInt(hunkMatch[3]),
          newLines: hunkMatch[4] ? parseInt(hunkMatch[4]) : 1,
          lines: []
        };
        currentFile.hunks.push(currentHunk);
        continue;
      }

      // Process hunk content lines
      if (currentHunk && (line.startsWith('+') || line.startsWith('-') || line.startsWith(' '))) {
        currentHunk.lines.push(line);
        
        if (line.startsWith('+')) {
          currentFile.additions++;
        } else if (line.startsWith('-')) {
          currentFile.deletions++;
        }
      }
    }

    // Add the last file if it exists
    if (currentFile) {
      files.push(currentFile);
    }

    return { files };
  }

  /**
   * Determine file status based on surrounding lines
   * @param {Array} lines - All diff lines
   * @param {number} index - Current line index
   * @returns {string} File status (modified, added, deleted, renamed)
   */
  _determineFileStatus(lines, index) {
    // Look ahead for rename indicators
    for (let i = index + 1; i < Math.min(index + 5, lines.length); i++) {
      if (lines[i].startsWith('rename from ')) {
        return 'renamed';
      }
    }
    
    // Check if it's a new file (no --- a/ line before +++ b/)
    if (index > 0 && lines[index - 1].startsWith('new file mode')) {
      return 'added';
    }
    
    // Check if it's a deleted file
    if (index + 1 < lines.length && lines[index + 1].startsWith('deleted file mode')) {
      return 'deleted';
    }
    
    return 'modified';
  }

  /**
   * Get statistics about the diff
   * @param {Object} parsedDiff - Parsed diff object
   * @returns {Object} Statistics
   */
  getStats(parsedDiff) {
    if (!parsedDiff || !parsedDiff.files) {
      return { totalFiles: 0, totalAdditions: 0, totalDeletions: 0 };
    }

    let totalFiles = parsedDiff.files.length;
    let totalAdditions = 0;
    let totalDeletions = 0;

    parsedDiff.files.forEach(file => {
      totalAdditions += file.additions || 0;
      totalDeletions += file.deletions || 0;
    });

    return { totalFiles, totalAdditions, totalDeletions };
  }
}

module.exports = DiffParser;