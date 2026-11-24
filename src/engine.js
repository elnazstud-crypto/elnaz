export const BOARD_SIZE = 8;
export const GEM_TYPES = ["ruby", "sapphire", "emerald", "topaz", "amethyst", "sunstone"];

export function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

export function createBoard(random = Math.random, size = BOARD_SIZE) {
  const board = Array.from({ length: size }, () => Array(size).fill(null));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let choices = GEM_TYPES;
      if (c >= 2 && board[r][c - 1]?.type === board[r][c - 2]?.type) {
        choices = choices.filter(type => type !== board[r][c - 1].type);
      }
      if (r >= 2 && board[r - 1][c]?.type === board[r - 2][c]?.type) {
        choices = choices.filter(type => type !== board[r - 1][c].type);
      }
      board[r][c] = { type: choices[Math.floor(random() * choices.length)], special: null };
    }
  }
  if (!hasLegalMove(board)) return createBoard(random, size);
  return board;
}

export function findMatches(board) {
  const size = board.length;
  const matched = new Set();
  const runs = [];
  for (let r = 0; r < size; r++) {
    let c = 0;
    while (c < size) {
      const type = board[r][c]?.type;
      if (!type) { c++; continue; }
      let end = c + 1;
      while (end < size && board[r][end]?.type === type) end++;
      if (end - c >= 3) {
        const cells = [];
        for (let x = c; x < end; x++) { matched.add(`${r},${x}`); cells.push([r, x]); }
        runs.push({ axis: "horizontal", type, cells, length: end - c });
      }
      c = end;
    }
  }
  for (let c = 0; c < size; c++) {
    let r = 0;
    while (r < size) {
      const type = board[r][c]?.type;
      if (!type) { r++; continue; }
      let end = r + 1;
      while (end < size && board[end][c]?.type === type) end++;
      if (end - r >= 3) {
        const cells = [];
        for (let y = r; y < end; y++) { matched.add(`${y},${c}`); cells.push([y, c]); }
        runs.push({ axis: "vertical", type, cells, length: end - r });
      }
      r = end;
    }
  }
  const cells = [...matched].map(key => key.split(",").map(Number));
  return { cells, runs };
}

export function swapCells(board, a, b) {
  const next = cloneBoard(board);
  const [ar, ac] = a, [br, bc] = b;
  if (Math.abs(ar - br) + Math.abs(ac - bc) !== 1) return { board: next, valid: false, matches: { cells: [], runs: [] } };
  [next[ar][ac], next[br][bc]] = [next[br][bc], next[ar][ac]];
  const matches = findMatches(next);
  if (!matches.cells.length) return { board: cloneBoard(board), valid: false, matches };
  return { board: next, valid: true, matches };
}

export function hasLegalMove(board) {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c + 1 < size && swapCells(board, [r,c], [r,c+1]).valid) return true;
      if (r + 1 < size && swapCells(board, [r,c], [r+1,c]).valid) return true;
    }
  }
  return false;
}

export function applyGravity(board, random = Math.random) {
  const size = board.length;
  const next = cloneBoard(board);
  for (let c = 0; c < size; c++) {
    const survivors = [];
    for (let r = size - 1; r >= 0; r--) if (next[r][c]) survivors.push(next[r][c]);
    let index = 0;
    for (let r = size - 1; r >= 0; r--) {
      next[r][c] = survivors[index++] || { type: GEM_TYPES[Math.floor(random() * GEM_TYPES.length)], special: null, fresh: true };
    }
  }
  return next;
}

export function specialForMatch(matches) {
  const longest = Math.max(0, ...matches.runs.map(run => run.length));
  const horizontal = matches.runs.some(run => run.axis === "horizontal");
  const vertical = matches.runs.some(run => run.axis === "vertical");
  if (longest >= 5) return "rainbow";
  if (horizontal && vertical) return "bomb";
  if (longest === 4) return horizontal ? "rocket-h" : "rocket-v";
  return null;
}

export function resolveMatches(board, random = Math.random, maxWaves = 20) {
  let current = cloneBoard(board);
  let totalCleared = 0;
  let waves = 0;
  const waveDetails = [];
  while (waves < maxWaves) {
    const matches = findMatches(current);
    if (!matches.cells.length) break;
    const special = specialForMatch(matches);
    const keep = matches.cells[0];
    for (const [r, c] of matches.cells) {
      if (special && r === keep[0] && c === keep[1]) {
        current[r][c] = { ...current[r][c], special };
      } else {
        current[r][c] = null;
      }
    }
    const cleared = matches.cells.length - (special ? 1 : 0);
    totalCleared += cleared;
    waveDetails.push({ matched: matches.cells.length, cleared, special });
    current = applyGravity(current, random);
    waves++;
  }
  return { board: current, totalCleared, waves, waveDetails };
}

export function boardIsStable(board) {
  return findMatches(board).cells.length === 0;
}
