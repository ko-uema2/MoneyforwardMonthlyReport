import {
  CategoryListStrategy,
  DynamoDBTableNameStrategy,
  EnvContext,
  EnvVar,
  NotionAuthStrategy,
  NotionDBIdStrategy,
  strategyMap,
} from "../lambda/utils/strategy/envStrategy";

describe("EnvVarStrategy", () => {
  describe("NotionAuthStrategy", () => {
    const strategy = new NotionAuthStrategy();

    afterEach(() => {
      delete process.env.TEST_VAR;
    });

    test("should return true for valid NotionAuth", () => {
      process.env.TEST_VAR =
        "secret_abcdefghijklmnopqrstuvwxyz4567890ABCDEFGHIJ";
      expect(strategy.checkEnvVar("TEST_VAR")).toBe(true);
    });

    test("should return false for invalid NotionAuth", () => {
      process.env.TEST_VAR = "invalid_secret";
      expect(strategy.checkEnvVar("TEST_VAR")).toBe(false);
    });
  });

  describe("NotionDBIdStrategy", () => {
    const strategy = new NotionDBIdStrategy();

    afterEach(() => {
      delete process.env.TEST_VAR;
    });

    test("should return true for valid NotionDBId", () => {
      process.env.TEST_VAR = "abcdefghijklmnopqrstuvwxyz123456";
      expect(strategy.checkEnvVar("TEST_VAR")).toBe(true);
    });

    test("should return false for invalid NotionDBId", () => {
      process.env.TEST_VAR = "invalid_id";
      expect(strategy.checkEnvVar("TEST_VAR")).toBe(false);
    });
  });

  describe("CategoryListStrategy", () => {
    const strategy = new CategoryListStrategy();

    afterEach(() => {
      delete process.env.TEST_VAR;
    });

    test("should return true for valid CategoryList", () => {
      process.env.TEST_VAR = "category1,category2,category3";
      expect(strategy.checkEnvVar("TEST_VAR")).toBe(true);
    });

    test("should return false for invalid CategoryList", () => {
      process.env.TEST_VAR = "category1,,category3";
      expect(strategy.checkEnvVar("TEST_VAR")).toBe(false);
    });
  });

  describe("DynamoDBTableNameStrategy", () => {
    const strategy = new DynamoDBTableNameStrategy();

    afterEach(() => {
      delete process.env.TEST_VAR;
    });

    test("should return true for valid DynamoDBTableName", () => {
      process.env.TEST_VAR = "valid_table_name";
      expect(strategy.checkEnvVar("TEST_VAR")).toBe(true);
    });

    test("should return false for invalid DynamoDBTableName", () => {
      process.env.TEST_VAR = "";
      expect(strategy.checkEnvVar("TEST_VAR")).toBe(false);
    });
  });

  describe("EnvContext", () => {
    let context: EnvContext;

    beforeEach(() => {
      context = new EnvContext(new NotionAuthStrategy());
    });

    afterEach(() => {
      delete process.env.VALID_TEST_VAR;
      delete process.env.INVALID_TEST_VAR;
    });

    test("should return true for valid env var", () => {
      process.env.VALID_TEST_VAR =
        "secret_abcdefghijklmnopqrstuvwxyz4567890ABCDEFGHIJ";
      expect(context.executeStrategy("VALID_TEST_VAR")).toBe(true);
    });

    test("should return false for invalid env var", () => {
      process.env.INVALID_TEST_VAR = "invalid_secret";
      expect(context.executeStrategy("INVALID_TEST_VAR")).toBe(false);
    });
  });

  describe("strategyMap", () => {
    test("should map the correct strategies", () => {
      expect(strategyMap[EnvVar.notionAuth]).toBeInstanceOf(NotionAuthStrategy);
      expect(strategyMap[EnvVar.notionDBId]).toBeInstanceOf(NotionDBIdStrategy);
      expect(strategyMap[EnvVar.categoryList]).toBeInstanceOf(
        CategoryListStrategy
      );
      expect(strategyMap[EnvVar.dynamoDBTableName]).toBeInstanceOf(
        DynamoDBTableNameStrategy
      );
    });
  });
});
