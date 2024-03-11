import {
  CategoryListPolicy,
  DynamoDBTableNamePolicy,
  NotionAuthPolicy,
  NotionDBIdPolicy,
} from "../policy/envPolicy";

// 環境変数の名前を列挙型で定義
export enum EnvVar {
  notionAuth = "NOTION_AUTH",
  notionDBId = "NOTIONDB_ID",
  categoryList = "CATEGORY_LIST",
  dynamoDBTableName = "DYNAMODB_TABLE_NAME",
}

// 環境変数のチェック戦略を定義するインターフェース
interface EnvVarStrategy {
  /**
   * 環境変数をチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式であればtrue、そうでなければfalseを返す
   */
  checkEnvVar(envVar: string | undefined): boolean;
}

// NotionAuthのチェック戦略を定義するクラス
export class NotionAuthStrategy implements EnvVarStrategy {
  /**
   * NotionAuthをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のNotionAuthであればtrue、そうでなければfalseを返す
   */
  checkEnvVar(envVar: string | undefined): boolean {
    const policy = new NotionAuthPolicy();
    return policy.checkNotionAuth(envVar);
  }
}

// NotionDBIdのチェック戦略を定義するクラス
export class NotionDBIdStrategy implements EnvVarStrategy {
  /**
   * NotionDBIdをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のNotionDBIdであればtrue、そうでなければfalseを返す
   */
  checkEnvVar(envVar: string | undefined): boolean {
    const policy = new NotionDBIdPolicy();
    return policy.checkNotionDBId(envVar);
  }
}

// CategoryListのチェック戦略を定義するクラス
export class CategoryListStrategy implements EnvVarStrategy {
  /**
   * CategoryListをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のCategoryListであればtrue、そうでなければfalseを返す
   */
  checkEnvVar(envVar: string | undefined): boolean {
    const policy = new CategoryListPolicy();
    return policy.checkCategoryList(envVar);
  }
}

// DynamoDBTableNameのチェック戦略を定義するクラス
export class DynamoDBTableNameStrategy implements EnvVarStrategy {
  /**
   * DynamoDBTableNameをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のDynamoDBTableNameであればtrue、そうでなければfalseを返す
   */
  checkEnvVar(envVar: string | undefined): boolean {
    const policy = new DynamoDBTableNamePolicy();
    return policy.checkDynamoDBTableName(envVar);
  }
}

// 環境変数のチェック戦略を実行するコンテキストクラス
export class EnvContext {
  /**
   * EnvContextのコンストラクタ
   * @param envVarStrategy 使用する戦略
   */
  private envVarStrategy: EnvVarStrategy;

  constructor(envVarStrategy: EnvVarStrategy) {
    this.envVarStrategy = envVarStrategy;
  }

  /**
   * 選択された戦略を実行するメソッド
   * @param envVar チェックする環境変数
   * @return 選択された戦略に基づいてチェックした結果。環境変数が正しい形式であればtrue、そうでなければfalseを返す
   */
  public executeStrategy(envVar: string | undefined): boolean {
    return this.envVarStrategy.checkEnvVar(envVar);
  }
}

// 各環境変数に対応する戦略をマッピング
export const strategyMap: { [key in EnvVar]: EnvVarStrategy } = {
  [EnvVar.notionAuth]: new NotionAuthStrategy(),
  [EnvVar.notionDBId]: new NotionDBIdStrategy(),
  [EnvVar.categoryList]: new CategoryListStrategy(),
  [EnvVar.dynamoDBTableName]: new DynamoDBTableNameStrategy(),
};
