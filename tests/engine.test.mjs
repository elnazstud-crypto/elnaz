import test from "node:test";
import assert from "node:assert/strict";
import { findMatches, swapCells, hasLegalMove, applyGravity, resolveMatches, boardIsStable, specialForMatch } from "../src/engine.js";

const boardFrom = rows => rows.map(row => row.split("").map(type => type === "." ? null : ({ type, special: null })));
const sequenceRandom = () => { let n=0; return () => ((n++ * 0.61803398875) % 1); };

test("detects horizontal matches", () => {
  const board = boardFrom(["AAABCDEF","BCDEFABC","CDEFABCD","DEFABCDE","EFABCDEF","FABCDEFA","ABCDEFAB","BCDEFABC"]);
  const result = findMatches(board);
  assert.ok(result.runs.some(run => run.axis === "horizontal"));
  assert.equal(result.cells.length, 3);
});

test("detects vertical matches", () => {
  const board = boardFrom(["ABCDEFGH","ACDEFGHB","ADEFGHBC","BEFGHACD","CFGHABDE","DFGHABEC","EFGHABCD","FGHABCDE"]);
  const result = findMatches(board);
  assert.ok(result.runs.some(run => run.axis === "vertical"));
  assert.ok(result.runs.some(run => run.axis === "vertical" && run.cells.some(([r,c]) => c === 0)));
});

test("rejects non-adjacent swaps and preserves board on invalid swap", () => {
  const board = boardFrom(["ABCDEFAB","BCDEFABC","CDEFABCD","DEFABCDE","EFABCDEF","FABCDEFA","ABCDEFAB","BCDEFABC"]);
  const result = swapCells(board, [0,0], [0,2]);
  assert.equal(result.valid, false);
  assert.deepEqual(result.board, board);
});

test("gravity compacts columns and fills every empty cell", () => {
  const board = boardFrom(["A.......","B.......","C.......","D.......","E.......","F.......","A.......","B......."]);
  const next = applyGravity(board, sequenceRandom());
  assert.ok(next.every(row => row.every(Boolean)));
});

test("resolving matches clears the run and reaches a stable board", () => {
  const board = boardFrom(["AAABCDEF","BCDEFABC","CDEFABCD","DEFABCDE","EFABCDEF","FABCDEFA","ABCDEFAB","BCDEFABC"]);
  const result = resolveMatches(board, sequenceRandom());
  assert.ok(result.totalCleared >= 3);
  assert.ok(result.waves >= 1);
  assert.equal(boardIsStable(result.board), true);
});

test("five-gem runs create a rainbow special", () => {
  const result = { cells: [[0,0],[0,1],[0,2],[0,3],[0,4]], runs: [{axis:"horizontal",length:5}] };
  assert.equal(specialForMatch(result), "rainbow");
});

test("legal move detection returns a boolean", () => {
  const board = boardFrom(["ABCDEFAB","BCDEFABC","CDEFABCD","DEFABCDE","EFABCDEF","FABCDEFA","ABCDEFAB","BCDEFABC"]);
  assert.equal(typeof hasLegalMove(board), "boolean");
});
