import { Segment, Subsegment } from "aws-xray-sdk-core";
import { ExpenseData } from "./type/type";
import { CSVToJsonConverter } from "./csvToJsonConverter";
import { errorHandle } from "./utils/decorator/errorHandle";

/**
 * CSV文字列から支出データを抽出するクラス
 */
export class ExpenseDataExtractor {
  private readonly csvStr: string;

  /**
   * ExpenseDataExtractorのコンストラクタ
   * @param {string} csvStr - CSV文字列
   * @param {Segment | Subsegment} segment - AWS X-Rayのセグメント
   */
  constructor(csvStr: string) {
    this.csvStr = csvStr;
  }

  /**
   * CSV文字列から支出データと日付を抽出します。
   * @returns {Promise<{ jsonExpenseDataArray: ExpenseData[]; expensedDate: string; }>} 支出データの配列と日付
   * @throws {AppError} 抽出に失敗した場合
   */
  @errorHandle
  async extract(): Promise<{
    jsonExpenseDataArray: ExpenseData[];
    expensedDate: string;
  }> {
    // csvファイルからJSONオブジェクトを生成
    const csvToJson = new CSVToJsonConverter(this.csvStr);
    const jsonExpenseDataArray = csvToJson.convert();

    // csvデータの日付を取得
    const expensedDate = this.extractExpenseMonth(jsonExpenseDataArray);

    return { jsonExpenseDataArray, expensedDate };
  }

  /**
   * 支出データ配列から日付を抽出します。
   * @param {ExpenseData[]} expenseDataArray - 支出データの配列
   * @returns {string} 年と月をハイフンで結合した文字列
   * @throws {Error} 支出データ配列が空の場合、または日付の形式が無効な場合
   */
  private extractExpenseMonth(expenseDataArray: ExpenseData[]): string {
    // ガード節
    if (!expenseDataArray.length) {
      throw new Error("Expense data array is empty.");
    }

    // 日付から年と月を抽出
    const dateRegex = /(\d{4})\/(\d{2})\/\d{2}/;
    const match = expenseDataArray[0]["日付"].match(dateRegex);

    if (!match) {
      throw new Error("Invalid date format.");
    }

    // 年と月をハイフンで結合
    const yearAndMonth = `${match[1]}-${match[2]}`;

    return yearAndMonth;
  }
}
