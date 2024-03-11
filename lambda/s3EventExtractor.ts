import { S3Event } from "aws-lambda";
import { logger, tracer } from "./utils/powertools";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3_OBJECT_NOT_FOUND } from "./utils/constant";
import { errorHandle } from "./utils/decorator/errorHandle";

/**
 * S3イベントからCSVの内容を抽出するクラス
 */
export class S3EventExtractor {
  private readonly s3Client: S3Client;
  private readonly event: S3Event;

  /**
   * S3EventExtractorのコンストラクタ
   * @param {S3Event} event - S3イベント
   * @param {Segment | Subsegment} segment - AWS X-Rayのセグメント
   */
  constructor(event: S3Event) {
    this.s3Client = tracer.captureAWSv3Client(new S3Client({}));
    this.event = event;
  }

  /**
   * S3イベントからCSVの内容を取得します。
   * @returns {Promise<Uint8Array>} CSVの内容を表すバイト配列
   * @throws {AppError} S3からのファイル取得に失敗した場合
   */
  @errorHandle
  async getCSVContents(): Promise<Uint8Array> {
    // イベントからバケット名とキーを取得
    const bucket = this.event.Records[0].s3.bucket.name;
    // マルチバイト文字がURLエンコードされているためデコード処理を実施
    const key = decodeURI(this.event.Records[0].s3.object.key);

    logger.debug(key);

    // S3からファイル取得
    const response = await this.s3Client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    // レスポンスからファイルをshift-JISのバイト配列として取得
    const shiftJISByteArray = await response.Body?.transformToByteArray();
    if (!shiftJISByteArray) {
      throw new Error(S3_OBJECT_NOT_FOUND);
    }

    return shiftJISByteArray;
  }
}
