import { Segment, Subsegment } from "aws-xray-sdk-core";
import { Client } from "@notionhq/client";
import { AppError } from "./error/appError";
import { EnvContext, EnvVar, strategyMap } from "./utils/strategy/envStrategy";
import { errorHandle } from "./utils/decorator/errorHandle";

/**
 * Notion APIとのインタラクションを管理するクラス
 */
export class Notion {
  private notionClient: Client;
  private notionWriteDBId: string;

  /**
   * Notionクラスのコンストラクタ
   * @param {Object} requiredEnvVars - 必要な環境変数を含むオブジェクト。キーは環境変数の名前、値はその環境変数の値。
   */
  constructor(requiredEnvVars: { [key: string]: string }) {
    // 必要な環境変数の有効性チェック
    const invalidEnvVars: { [key: string]: string | undefined } = {};
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      const envVarStrategy = strategyMap[key as EnvVar];
      if (!envVarStrategy) {
        throw new AppError(Notion.name, `strategy not found: ${key}`);
      }

      const envVarContext = new EnvContext(envVarStrategy);
      if (!envVarContext.executeStrategy(value)) {
        invalidEnvVars[key] = value;
      }
    }
    if (Object.keys(invalidEnvVars).length > 0) {
      throw new AppError(
        Notion.name,
        `environment variables are invalid: ${Object.keys(invalidEnvVars).join(
          ", "
        )}`
      );
    }

    // Notionクライアント初期化
    this.notionClient = new Client({ auth: requiredEnvVars.NOTION_AUTH });
    this.notionWriteDBId = requiredEnvVars.NOTIONDB_ID;
  }

  /**
   * 指定されたセグメントとカテゴリ別の合計をNotionデータベースに書き込む
   * @param {{ [key: string]: number }} sumByCategory - カテゴリ別の合計
   * @param {string} expensedDate - 経費発生日
   * @returns {Promise<void>}
   */
  @errorHandle
  async writeDB(
    sumByCategory: { [key: string]: number },
    expensedDate: string
  ): Promise<void> {
    // notion APIに送信するpayloadを作成
    const payload = this.createNotionPayload(sumByCategory, expensedDate);

    // Notion APIにページ作成リクエスト送信
    await this.notionClient.pages.create(payload);
  }

  /**
   * Notion APIに送信するためのペイロードを作成する
   * @param {{ [key: string]: number }} sumByCategory - カテゴリ別の合計
   * @param {string} expensedDate - 経費発生日 yyyy/MM
   * @returns {Object} ペイロード
   */
  private createNotionPayload(
    sumByCategory: { [key: string]: number },
    expensedDate: string
  ) {
    const properties = Object.keys(sumByCategory).reduce(
      (
        acc:
          | { [key: string]: { number: number } }
          | {
              [key: string]: {
                title: [{ type: "text"; text: { content: string } }];
              };
            },
        key: string
      ) => {
        acc[key] = {
          number: sumByCategory[key],
        };
        return acc;
      },
      {}
    );

    properties["月"] = {
      title: [
        {
          type: "text",
          text: {
            content: expensedDate,
          },
        },
      ],
    };

    // ペイロード返却
    return {
      parent: {
        database_id: this.notionWriteDBId,
      },
      properties,
    };
  }
}
