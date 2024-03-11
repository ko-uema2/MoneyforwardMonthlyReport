import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { tracer } from "./utils/powertools";
import { AppError } from "./error/appError";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { EnvContext, EnvVar, strategyMap } from "./utils/strategy/envStrategy";
import { errorHandle } from "./utils/decorator/errorHandle";

/**
 * DynamoDBとのインタラクションを管理するクラス
 */
export class Dynamo {
  private dynamoDBDocumentClient: DynamoDBDocumentClient;
  private tableName: string;

  /**
   * Dynamoクラスのコンストラクタ
   * @param {Object} requiredEnvVars - 必要な環境変数を含むオブジェクト。キーは環境変数の名前、値はその環境変数の値。
   */
  constructor(requiredEnvVars: { [key: string]: string }) {
    // 引数の有効性チェック
    const invalidEnvVars: { [key: string]: string | undefined } = {};
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      const envVarStrategy = strategyMap[key as EnvVar];
      if (!envVarStrategy) {
        throw new AppError(Dynamo.name, `strategy not found: ${key}`);
      }

      const envVarContext = new EnvContext(envVarStrategy);
      if (!envVarContext.executeStrategy(value)) {
        invalidEnvVars[key] = value;
      }
    }
    if (Object.keys(invalidEnvVars).length > 0) {
      throw new AppError(
        Dynamo.name,
        `environment variables are invalid: ${Object.keys(invalidEnvVars).join(
          ", "
        )}`
      );
    }

    // DynamoDBクライアントの初期化
    this.dynamoDBDocumentClient = DynamoDBDocumentClient.from(
      tracer.captureAWSv3Client(
        new DynamoDBClient({ region: "ap-northeast-1" })
      )
    );
    this.tableName = requiredEnvVars.DYNAMODB_TABLE_NAME;
  }

  /**
   * 指定されたカテゴリ別の合計をDynamoDBに書き込む
   * @param {{ [key: string]: number }} sumByCategory - カテゴリ別の合計
   * @param {string} expensedDate - 経費発生日
   * @returns {Promise<void>}
   */
  @errorHandle
  async writeDB(
    sumByCategory: { [key: string]: number },
    expensedDate: string
  ) {
    // DynamoDBにデータを書き込む
    await this.dynamoDBDocumentClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          expensedDate: expensedDate,
          ...sumByCategory,
        },
      })
    );
  }
}
