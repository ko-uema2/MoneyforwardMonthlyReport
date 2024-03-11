// 環境変数のルールをチェックするためのインターフェース
interface EnvVarRule {
  /**
   * 環境変数をチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数がルールに適合していればtrue、そうでなければfalseを返す
   */
  check: (envVar: string | undefined) => boolean;
}

// から文字列をチェックするルール
export class NotEmptyStringRule implements EnvVarRule {
  /**
   * 空文字列をチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が空文字列でなければtrue、そうでなければfalseを返す
   */
  check(envVar: string | undefined): boolean {
    return envVar !== "";
  }
}

// undefinedをチェックするルール
export class NotUndefinedRule implements EnvVarRule {
  /**
   * undefinedをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数がundefinedでなければtrue、そうでなければfalseを返す
   */
  check(envVar: string | undefined): boolean {
    return typeof envVar !== "undefined";
  }
}

// Notionの認証情報をチェックするルール
export class ValidNotionAuthRule implements EnvVarRule {
  /**
   * Notionの認証情報をチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のNotionの認証情報であればtrue、そうでなければfalseを返す
   */
  check(envVar: string | undefined): boolean {
    const regex = /^secret_[A-Za-z0-9]{43}$/;
    return envVar ? regex.test(envVar) : false;
  }
}

// NotionのデータベースIDをチェックするルール
export class ValidNotionDBIdRule implements EnvVarRule {
  /**
   * NotionのデータベースIDをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のNotionのデータベースIDであればtrue、そうでなければfalseを返す
   */
  check(envVar: string | undefined): boolean {
    const regex = /^[a-z0-9]{32}$/;
    return envVar ? regex.test(envVar) : false;
  }
}

// カンマ区切りの文字列をチェックするルール
export class CommaSeparatedRule implements EnvVarRule {
  /**
   * カンマ区切りの文字列をチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のカンマ区切りの文字列であればtrue、そうでなければfalseを返す
   */
  check(envVar: string | undefined): boolean {
    const regex = /^[^,]+(,[^,]+)*$/;
    return envVar ? regex.test(envVar) : false;
  }
}

// 環境変数のポリシーを管理するクラス
class EnvVarPolicy {
  private rules: Set<EnvVarRule>;

  constructor() {
    this.rules = new Set();
  }

  /**
   * ルールを追加するメソッド
   * @param rule 追加するルール
   */
  addRule(rule: EnvVarRule): void {
    this.rules.add(rule);
  }

  /**
   * 全てのルールをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 全てのルールが適合していればtrue、そうでなければfalseを返す
   */
  checkAllRule(envVar: string | undefined): boolean {
    for (const rule of this.rules) {
      if (!rule.check(envVar)) {
        return false;
      }
    }
    return true;
  }
}

// Notionの認証情報のポリシーを管理するクラス
export class NotionAuthPolicy {
  private policy: EnvVarPolicy;

  constructor() {
    this.policy = new EnvVarPolicy();
    // チェックするルールを追加
    this.policy.addRule(new NotUndefinedRule());
    this.policy.addRule(new NotEmptyStringRule());
    this.policy.addRule(new ValidNotionAuthRule());
  }

  /**
   * Notionの認証情報をチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のNotionの認証情報であればtrue、そうでなければfalseを返す
   */
  checkNotionAuth(envVar: string | undefined): boolean {
    return this.policy.checkAllRule(envVar);
  }
}

// NotionのデータベースIDのポリシーを管理するクラス
export class NotionDBIdPolicy {
  private policy: EnvVarPolicy;

  constructor() {
    this.policy = new EnvVarPolicy();
    // チェックするルールを追加
    this.policy.addRule(new NotUndefinedRule());
    this.policy.addRule(new NotEmptyStringRule());
    this.policy.addRule(new ValidNotionDBIdRule());
  }

  /**
   * NotionのデータベースIDをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のNotionのデータベースIDであればtrue、そうでなければfalseを返す
   */
  checkNotionDBId(envVar: string | undefined): boolean {
    return this.policy.checkAllRule(envVar);
  }
}

// カテゴリリストのポリシーを管理するクラス
export class CategoryListPolicy {
  private policy: EnvVarPolicy;

  constructor() {
    this.policy = new EnvVarPolicy();
    // チェックするルールを追加
    this.policy.addRule(new NotUndefinedRule());
    this.policy.addRule(new NotEmptyStringRule());
    this.policy.addRule(new CommaSeparatedRule());
  }

  /**
   * カテゴリリストをチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のカテゴリリストであればtrue、そうでなければfalseを返す
   */
  checkCategoryList(envVar: string | undefined): boolean {
    return this.policy.checkAllRule(envVar);
  }
}

// DynamoDBのテーブル名のポリシーを管理するクラス
export class DynamoDBTableNamePolicy {
  private policy: EnvVarPolicy;

  constructor() {
    this.policy = new EnvVarPolicy();
    // チェックするルールを追加
    this.policy.addRule(new NotUndefinedRule());
    this.policy.addRule(new NotEmptyStringRule());
  }

  /**
   * DynamoDBのテーブル名をチェックするメソッド
   * @param envVar チェックする環境変数
   * @return 環境変数が正しい形式のDynamoDBのテーブル名であればtrue、そうでなければfalseを返す
   */
  checkDynamoDBTableName(envVar: string | undefined): boolean {
    return this.policy.checkAllRule(envVar);
  }
}
