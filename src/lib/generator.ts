export type Board = number[][];

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
