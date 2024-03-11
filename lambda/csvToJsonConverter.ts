import * as Papa from "papaparse";
import { ExpenseData } from "./type/type";
import { logger } from "./utils/powertools";
import { errorHandle } from "./utils/decorator/errorHandle";

/**
 * CSV文字列をJSONオブジェクトに変換するクラス
 */
export class CSVToJsonConverter {
  private readonly csvStr: string;

  /**
   * CSVToJsonConverterのコンストラクタ
   * @param {string} csvStr - CSV文字列
   * @param {Segment | Subsegment} segment - AWS X-Rayのセグメント
   */
  constructor(csvStr: string) {
    this.csvStr = csvStr;
  }

  /**
   * CSV文字列をJSONオブジェクトに変換します。
   * @returns {ExpenseData[]} 支出データの配列
   * @throws {AppError} 変換に失敗した場合
   */
  @errorHandle
  convert(): ExpenseData[] {
    // パース用の設定
    const parseConfig = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results: {
        data: ExpenseData[];
        errors: Papa.ParseError[];
        meta: Papa.ParseMeta;
      }) => {
        logger.info("Parsing complete");
        if (results.errors.length) {
          throw new Error("Errors while parsing:" + JSON.stringify(results));
        }
      },
    };

    const parsed = Papa.parse(this.csvStr, parseConfig);

    const transformData = parsed.data.map((expense) => {
      return {
        ...expense,
        // 1 -> true, 0 -> false に変換
        計算対象: !!expense["計算対象"],
        振替: !!expense["振替"],
      };
    });

    return transformData;
  }
}
