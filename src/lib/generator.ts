export type Board = number[][];
/* 預設難度選項 */
// 17 ~ 79
export const DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'] as const;
export type Difficulty = typeof DIFFICULTIES[number];
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    expert: 'Expert',
};

const CLUE_RANGE: Record<Difficulty, [number, number]> = {
    easy: [46, 55],
    medium: [37, 45],
    hard: [31, 36],
    expert: [25, 30],
}

/* 超簡單難度選項 */
// export const DIFFICULTIES = ['medium'] as const;
// export type Difficulty = typeof DIFFICULTIES[number];
// export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
//     medium: 'Medium',
// };

// const CLUE_RANGE: Record<Difficulty, [number, number]> = {
//     medium: [79, 79],
// }

function shuffled<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/** 產生一個完整且合法的數獨題目（9×9） */
export function generateFullSolution(): Board {
    const base = 3;
    const side = base * base;

    // 依 3×3 band/stack 的群組打散列與欄
    const rBase = [0, 1, 2];
    const rows = shuffled(rBase).flatMap(g =>
        shuffled(rBase).map(r => g * base + r)
    );
    const cols = shuffled(rBase).flatMap(g =>
        shuffled(rBase).map(c => g * base + c)
    );

    // 數字 1~9 打散
    const nums = shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // 基底圖樣：((row % 3) * 3 + floor(row / 3) + col) % 9
    const pattern = (r: number, c: number) =>
        (base * (r % base) + Math.floor(r / base) + c) % side;

    // 按照 rows/cols 的隨機順序組裝，並映射到打散後的 nums
    const board: Board = rows.map(r => cols.map(c => nums[pattern(r, c)]));
    return board;
}


// ====== 工具：數獨解的計數器（早停在 >= limit） ======
function countSolutions(grid: number[][], limit = 2): number {
    const board = grid.map(row => row.slice())

    function isValid(r: number, c: number, v: number): boolean {
        for (let i = 0; i < 9; i++) {
            if (board[r][i] === v || board[i][c] === v) return false
        }
        const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
            if (board[br + i][bc + j] === v) return false
        }
        return true
    }

    function findEmpty(): [number, number] | null {
        // 可改成 MRV（找候選最少的格子）以加速
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
            if (board[r][c] === 0) return [r, c]
        }
        return null
    }

    let count = 0
    function dfs() {
        if (count >= limit) return // 早停
        const pos = findEmpty()
        if (!pos) { count++; return }
        const [r, c] = pos
        // 嘗試 1..9，順序可隨機打散以更平均
        for (let v = 1; v <= 9; v++) {
            if (isValid(r, c, v)) {
                board[r][c] = v
                dfs()
                if (count >= limit) return
                board[r][c] = 0
            }
        }
    }

    dfs()
    return count
}

// 將 solution + mask 組合成題目（給定用真值，其他為 0）
function buildPuzzleFromMask(solution: number[][], mask: boolean[][]): number[][] {
    const puzzle = Array.from({ length: 9 }, (_, r) =>
        Array.from({ length: 9 }, (_, c) => (mask[r][c] ? solution[r][c] : 0))
    )
    return puzzle
}

// 把 (r,c) 轉 0..80 的索引，反之亦然
// const toIndex = (r: number, c: number) => r * 9 + c
const fromIndex = (i: number) => [Math.floor(i / 9), i % 9] as const

// ====== 依對稱挖格，邊挖邊檢查唯一解 ======
function randInt(min: number, max?: number) {
    if (max === undefined) return min;         // 固定值
    if (min > max) [min, max] = [max, min];    // 防呆
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateUniquePuzzle(
    solution: number[][],
    diff: Difficulty = 'medium'
) {
    const total = 81
    const [minC, maxC] = CLUE_RANGE[diff]
    let targetClues = randInt(minC, maxC)

    // 先從「全部保留」開始，然後嘗試挖
    const mask = Array.from({ length: 9 }, () => Array(9).fill(true))
    let clues = total

    // 建立旋轉對稱配對（含中心獨立處理）
    const center = 40
    const pairs: Array<[number, number]> = []
    for (let i = 0; i < total / 2; i++) pairs.push([i, total - 1 - i])

    // 洗牌配對，隨機嘗試移除
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0
            ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
    }

    // 若目標為奇數，最後再嘗試移除中心
    const tryRemovePair = (i1: number, i2: number): boolean => {
        const [r1, c1] = fromIndex(i1)
        const [r2, c2] = fromIndex(i2)
        if (!mask[r1][c1] || !mask[r2][c2]) return false

        // 嘗試挖掉
        mask[r1][c1] = false
        mask[r2][c2] = false
        const puzzle = buildPuzzleFromMask(solution, mask)
        const n = countSolutions(puzzle, 2)
        if (n === 1 && clues - 2 >= targetClues) {
            clues -= 2
            return true
        } else {
            // 還原
            mask[r1][c1] = true
            mask[r2][c2] = true
            return false
        }
    }

    for (const [a, b] of pairs) {
        if (clues <= targetClues) break
        tryRemovePair(a, b)
    }

    if (clues > targetClues && targetClues % 2 === 1) {
        // 還需要移除 1 格，試著移除中心（維持唯一解）
        const [r, c] = fromIndex(center)
        if (mask[r][c]) {
            mask[r][c] = false
            const puzzle = buildPuzzleFromMask(solution, mask)
            const n = countSolutions(puzzle, 2)
            if (n === 1) clues -= 1
            else mask[r][c] = true
        }
    }

    // （可選）Minimality pass：能不能再移除而維持唯一解？
    // 這步驟會更慢，視需要開啟
    /*
    outer: for (let i = 0; i < total; i++) {
      const [r, c] = fromIndex(i)
      if (!mask[r][c]) continue
      mask[r][c] = false
      const puzzle = buildPuzzleFromMask(solution, mask)
      const n = countSolutions(puzzle, 2)
      if (n !== 1) mask[r][c] = true
    }
    */

    const puzzle = buildPuzzleFromMask(solution, mask)
    return { puzzle, mask, clues }
}

export function makeSymmetricPuzzleMask(diff: Difficulty = 'medium') {
    const [min, max] = CLUE_RANGE[diff]
    let clues = randInt(min, max)     // 依難度抽一個要保留的格數（clues）

    const total = 81
    const center = 40                 // 9x9 的中心（索引 0..80 的第 41 格）
    const keep = new Set<number>()    // 要「保留題目」的索引集合

    // 若要保留的格數是奇數，先把中心留住（保持旋轉對稱）
    if (clues % 2 === 1) {
        keep.add(center)
        clues -= 1
    }

    // 建立所有「旋轉對稱」配對：索引 i 與 80 - i 是一對
    const pairs: Array<[number, number]> = []
    for (let i = 0; i < total / 2; i++) {
        pairs.push([i, total - 1 - i])
    }

    // 洗牌配對，隨機選前 clues/2 對，加入 keep
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0
            ;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
    }
    const needPairs = clues / 2
    for (let k = 0; k < needPairs; k++) {
        const [a, b] = pairs[k]
        keep.add(a); keep.add(b)
    }

    // 把 keep 轉回 9x9 的布林矩陣（true = 保留題目）
    const mask = Array.from({ length: 9 }, () => Array(9).fill(false))
    for (let i = 0; i < total; i++) {
        mask[Math.floor(i / 9)][i % 9] = keep.has(i)
    }
    return mask
}

