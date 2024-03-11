import { ExpenseData } from "./type/type";
import { errorHandle } from "./utils/decorator/errorHandle";

/**
 * ExpenseCalculatorクラスは、カテゴリ別の支出合計を計算します。
 */
export class ExpenseCalculator {
  private categoryList: string[];
  private expenseData: ExpenseData[];

  /**
   * ExpenseCalculatorクラスの新しいインスタンスを生成します。
   * @param {string[]} categoryList - カテゴリのリスト
   * @param {ExpenseData[]} expenseData - 支出データの配列
   */
  constructor(categoryList: string[], expenseData: ExpenseData[]) {
    this.categoryList = categoryList;
    this.expenseData = expenseData;
  }

  /**
   * カテゴリ別の支出合計を計算します。
   * @returns {Object} カテゴリとその合計金額をプロパティとするオブジェクト
   */
  @errorHandle
  public sumByCategory(): { [key: string]: number } {
    const sumByCategory: { [key: string]: number } =
      this.initializeZeroValueObject(this.categoryList);

    for (const expenseData of this.expenseData) {
      // 計算対象でない場合はスキップ
      if (!expenseData["計算対象"]) continue;
      // 金額が正の値、つまり収入の場合はスキップ
      if (expenseData["金額（円）"] > 0) continue;

      const category = this.getCategory(expenseData);
      if (category && typeof expenseData["金額（円）"] === "number") {
        sumByCategory[category] += expenseData["金額（円）"];
      }
    }

    // sumByCategoryの各プロパティに対して絶対値を取得する
    Object.keys(sumByCategory).forEach((key) => {
      sumByCategory[key] = Math.abs(sumByCategory[key]);
    });

    return sumByCategory;
  }

  /**
   * キーが文字列、値が0のオブジェクトを初期化します。
   * @param {string[]} keys - オブジェクトのキーとなる文字列の配列
   * @returns {Object} 初期化されたオブジェクト
   */
  private initializeZeroValueObject(keys: string[]): { [key: string]: number } {
    return keys.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
  }

  /**
   * 指定された経費データのカテゴリを返します。
   * @param expenseData - 経費データ
   * @returns 経費データのカテゴリ
   */
  private getCategory(expenseData: ExpenseData): string {
    const categoryType = expenseData["中項目"].match(/^[1-4]/)?.[0];
    if (!categoryType) {
      throw new Error(`invalid category format: ${expenseData["中項目"]}`);
    }
    const categoryMap: { [key: string]: string } = {
      "1": "1. 定期・固定費",
      "2": "2. 定期・変動費",
      "3": "3. 不定期・固定費",
      "4": "4. 不定期・変動費",
    };

    return categoryMap[categoryType];
  }
}
