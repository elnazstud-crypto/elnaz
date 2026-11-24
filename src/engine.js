export const BOARD_SIZE = 8;
export const GEM_TYPES = ["ruby", "sapphire", "emerald", "topaz", "amethyst", "sunstone"];

export function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

export function createBoard(random = Math.random, size = BOARD_SIZE) {
  for (let attempt = 0; attempt < 100; attempt++) {
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
    if (hasLegalMove(board)) return board;
  }
  throw new Error("Unable to generate a board with a legal move");
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
  return { cells: [...matched].map(key => key.split(",").map(Number)), runs };
}

export function swapCells(board, a, b) {
  const next = cloneBoard(board);
  const [ar, ac] = a, [br, bc] = b;
  if (!next[ar]?.[ac] || !next[br]?.[bc] || Math.abs(ar - br) + Math.abs(ac - bc) !== 1) {
    return { board: next, valid: false, matches: { cells: [], runs: [] } };
  }
  [next[ar][ac], next[br][bc]] = [next[br][bc], next[ar][ac]];
  const first = next[ar][ac], second = next[br][bc];
  if (first?.special || second?.special) {
    return {
      board: next,
      valid: true,
      matches: { cells: [[ar, ac], [br, bc]], runs: [], specialCombo: true, rainbowTarget: second?.type }
    };
  }
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
      next[r][c] = survivors[index++] || {
        type: GEM_TYPES[Math.floor(random() * GEM_TYPES.length)], special: null, fresh: true
      };
    }
  }
  return next;
}

export function specialForMatch(matches) {
  const longest = Math.max(0, ...matches.runs.map(run => run.length));
  if (longest >= 5) return "rainbow";
  const horizontal = matches.runs.filter(run => run.axis === "horizontal");
  const vertical = matches.runs.filter(run => run.axis === "vertical");
  const crossing = horizontal.some(h => vertical.some(v =>
    h.cells.some(([hr, hc]) => v.cells.some(([vr, vc]) => hr === vr && hc === vc))
  ));
  if (crossing) return "bomb";
  if (longest === 4) {
    const run = matches.runs.find(item => item.length === 4);
    return run.axis === "horizontal" ? "rocket-h" : "rocket-v";
  }
  return null;
}

function expandSpecialEffects(board, initialCells, context = {}) {
  const size = board.length;
  const affected = new Set(initialCells.map(([r,c]) => `${r},${c}`));
  const queue = [...initialCells];
  let rainbowTarget = context.rainbowTarget;
  if (!rainbowTarget) {
    const counts = {};
    for (const row of board) for (const gem of row) if (gem && gem.special !== "rainbow") counts[gem.type] = (counts[gem.type] || 0) + 1;
    rainbowTarget = Object.entries(counts).sort((a,b) => b[1] - a[1])[0]?.[0];
  }
  while (queue.length) {
    const [r,c] = queue.shift();
    const gem = board[r]?.[c];
    if (!gem?.special) continue;
    const add = (rr,cc) => {
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) return;
      const key = `${rr},${cc}`;
      if (!affected.has(key)) { affected.add(key); queue.push([rr,cc]); }
    };
    if (gem.special === "rocket-h") for (let cc=0;cc<size;cc++) add(r,cc);
    else if (gem.special === "rocket-v") for (let rr=0;rr<size;rr++) add(rr,c);
    else if (gem.special === "bomb") for (let rr=r-1;rr<=r+1;rr++) for(let cc=c-1;cc<=c+1;cc++) add(rr,cc);
    else if (gem.special === "rainbow" && rainbowTarget) {
      for (let rr=0;rr<size;rr++) for(let cc=0;cc<size;cc++) if(board[rr][cc]?.type===rainbowTarget) add(rr,cc);
    }
  }
  return [...affected].map(key => key.split(",").map(Number));
}

export function resolveMatches(board, random = Math.random, maxWaves = 20, initialMatches = null) {
  let current = cloneBoard(board);
  let totalCleared = 0;
  let waves = 0;
  const waveDetails = [];
  let pending = initialMatches;
  while (waves < maxWaves) {
    const matches = pending || findMatches(current);
    pending = null;
    if (!matches.cells.length) break;
    const hasExistingSpecial = matches.cells.some(([r,c]) => current[r][c]?.special);
    const createdSpecial = hasExistingSpecial ? null : specialForMatch(matches);
    const expanded = expandSpecialEffects(current, matches.cells, matches);
    const keep = createdSpecial ? matches.cells.find(([r,c]) => !current[r][c]?.special) : null;
    for (const [r,c] of expanded) {
      if (keep && r === keep[0] && c === keep[1]) {
        current[r][c] = { ...current[r][c], special: createdSpecial };
      } else {
        current[r][c] = null;
      }
    }
    totalCleared += expanded.length - (keep ? 1 : 0);
    waveDetails.push({ matched: matches.cells.length, cleared: expanded.length - (keep ? 1 : 0), createdSpecial, specialCombo: !!matches.specialCombo });
    current = applyGravity(current, random);
    waves++;
  }
  return { board: current, totalCleared, waves, waveDetails };
}

export function boardIsStable(board) {
  return findMatches(board).cells.length === 0;
}
