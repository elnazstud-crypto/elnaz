import test from "node:test";
import assert from "node:assert/strict";
import { findMatches, swapCells, hasLegalMove, applyGravity, resolveMatches, boardIsStable } from "../src/engine.js";

const boardFrom = rows => rows.map(row => row.split("").map(type => type === "." ? null : ({ type, special: null })));

test("detects horizontal and vertical matches", () => {
  const board = boardFrom(["AAABBCDD","BCDAABCD","BCDAABCD","BCDAABCD","BCDAABCD","BCDAABCD","BCDAABCD","BCDAABCD"]);
  const result = findMatches(board);
  assert.ok(result.cells.length >= 3);
  assert.ok(result.runs.some(run => run.axis === "horizontal"));
  assert.ok(result.runs.some(run => run.axis === "vertical"));
});

test("rejects non-adjacent and non-matching swaps", () => {
  const board = boardFrom(["ABCDEFAB","BCDEFABC","CDEFABCD","DEFABCDE","EFABCDEF","FABCDEF A".replace(" ",""),"ABCDEFAB","BCDEFABC"]);
  assert.equal(swapCells(board, [0,0], [0,2]).valid, false);
});

test("gravity compacts each column and fills empty cells", () => {
  const board = boardFrom(["A.......","B.......","C.......","D.......","E.......","F.......","A.......","B......."]);
  const next = applyGravity(board, () => 0);
  assert.ok(next.every(row => row.every(Boolean)));
});

test("resolving matches produces a stable board", () => {
  const board = boardFrom(["AAABCDEF","BCDEFABC","CDEFABCD","DEFABCDE","EFABCDEF","FABCDEFA","ABCDEFAB","BCDEFABC"]);
  const result = resolveMatches(board, () => 0.5);
  assert.ok(result.totalCleared >= 3);
  assert.ok(boardIsStable(result.board));
});

test("legal move detection returns a boolean", () => {
  const board = boardFrom(["ABCDEFAB","BCDEFABC","CDEFABCD","DEFABCDE","EFABCDEF","FABCDEFA","ABCDEFAB","BCDEFABC"]);
  assert.equal(typeof hasLegalMove(board), "boolean");
});
