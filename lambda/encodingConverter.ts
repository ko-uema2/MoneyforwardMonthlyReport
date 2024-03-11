import { AppError } from "./error/appError";
import * as iconv from "iconv-lite";
import { UNKNOWN_ERROR_MESSAGE } from "./utils/constant";

// サポートするエンコーディングの型
type EncodingType = "utf-8" | "Shift_JIS";

/**
 * エンコーディング変換を行うクラス
 */
export class EncodingConverter {
  private readonly bufferArray: Uint8Array;
  private readonly encoding: EncodingType;

  /**
   * EncodingConverterクラスのコンストラクタ
   * @param {Uint8Array} bufferArray - 変換するバイト配列
   * @param {EncodingType} encoding - 入力のエンコーディングタイプ
   */
  constructor(bufferArray: Uint8Array, encoding: EncodingType) {
    this.bufferArray = bufferArray;
    this.encoding = encoding;
  }

  /**
   * バイト配列をUTF-8の文字列に変換します
   * @returns {string} UTF-8に変換された文字列
   * @throws {AppError} 変換中にエラーが発生した場合
   */
  toUTF8(): string {
    try {
      // バイト配列をBufferに変換
      const buffer = Buffer.from(this.bufferArray);
      // Bufferを指定されたエンコーディングからUTF-8に変換
      const utf8Str = iconv.decode(buffer, this.encoding);
      return utf8Str;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new AppError(this.toUTF8.name, error.message);
      } else {
        throw new AppError(this.toUTF8.name, UNKNOWN_ERROR_MESSAGE);
      }
    }
  }
}
