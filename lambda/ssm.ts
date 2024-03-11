import { tracer } from "./utils/powertools";
import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";
import {
  CATEGORY_LIST_KEY,
  NOTION_AUTH_KEY,
  NOTION_DB_ID_KEY,
  DYNAMO_DB_TABLE_NAME_KEY,
} from "./utils/constant";
import { errorHandle } from "./utils/decorator/errorHandle";

/**
 * AWSのSSMパラメータストアからパラメータを取得するクラス
 */
export class SSMParameterFetcher {
  private ssmClient: SSMClient;

  constructor() {
    this.ssmClient = tracer.captureAWSv3Client(
      new SSMClient({ region: "ap-northeast-1" })
    );
  }

  /**
   * SSMパラメータストアからパラメータを取得します。
   * @returns {Promise<{ [key: string]: string | undefined }>} パラメータのオブジェクト
   * @throws {AppError} パラメータの取得に失敗した場合
   */
  @errorHandle
  async getParameters(): Promise<{ [key: string]: string | undefined }> {
    //TODO ２回実行しているsendメソッドをストラテジーパターンでリファクタリングする
    const [secureStrResponse, strResponse] = await Promise.all([
      this.ssmClient.send(
        new GetParametersCommand({
          Names: [NOTION_AUTH_KEY, NOTION_DB_ID_KEY],
          WithDecryption: true,
        })
      ),
      this.ssmClient.send(
        new GetParametersCommand({
          Names: [CATEGORY_LIST_KEY, DYNAMO_DB_TABLE_NAME_KEY],
          WithDecryption: false,
        })
      ),
    ]);

    return {
      NOTION_AUTH: secureStrResponse.Parameters?.find(
        (p) => p.Name === NOTION_AUTH_KEY
      )?.Value,

      NOTIONDB_ID: secureStrResponse.Parameters?.find(
        (p) => p.Name === NOTION_DB_ID_KEY
      )?.Value,

      CATEGORY_LIST: strResponse.Parameters?.find(
        (p) => p.Name === CATEGORY_LIST_KEY
      )?.Value,

      DYNAMODB_TABLE_NAME: strResponse.Parameters?.find(
        (p) => p.Name === DYNAMO_DB_TABLE_NAME_KEY
      )?.Value,
    };
  }
}
