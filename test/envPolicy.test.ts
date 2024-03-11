import {
  CategoryListPolicy,
  CommaSeparatedRule,
  DynamoDBTableNamePolicy,
  NotEmptyStringRule,
  NotionAuthPolicy,
  NotionDBIdPolicy,
  NotUndefinedRule,
  ValidNotionAuthRule,
  ValidNotionDBIdRule,
} from "../lambda/utils/policy/envPolicy";

describe("Environment Variable Rules", () => {
  afterEach(() => {
    delete process.env.TEST_VAR;
  });

  describe("NotUndefinedRule", () => {
    const rule = new NotUndefinedRule();
    test("should return false if the environment variable is undefined", () => {
      delete process.env.TEST_VAR;
      expect(rule.check("TEST_VAR")).toBe(false);
    });

    test("should return true if the environment variable is defined", () => {
      process.env.TEST_VAR = "test";
      expect(rule.check("TEST_VAR")).toBe(true);
    });
  });

  describe("NotEmptyStringRule", () => {
    const rule = new NotEmptyStringRule();

    test("should return false if the environment variable is an empty string", () => {
      process.env.TEST_VAR = "";
      expect(rule.check("TEST_VAR")).toBe(false);
    });

    test("should return true if the environment variable is not an empty string", () => {
      process.env.TEST_VAR = "test";
      expect(rule.check("TEST_VAR")).toBe(true);
    });
  });

  describe("ValidNotionAuthRule", () => {
    const rule = new ValidNotionAuthRule();

    test("should return false if Notion Auth is not a valid secret", () => {
      process.env.TEST_VAR = "invalid_secret";
      expect(rule.check("TEST_VAR")).toBe(false);
    });

    test("should return true if Notion Auth is a valid secret", () => {
      process.env.TEST_VAR =
        "secret_abcdefghijklmnopqrstuvwxyz4567890ABCDEFGHIJ";
      expect(rule.check("TEST_VAR")).toBe(true);
    });
  });

  describe("ValidNotionDBIdRule", () => {
    const rule = new ValidNotionDBIdRule();

    test("should return false if Notion DB Id is not a valid id", () => {
      process.env.TEST_VAR = "invalid_id";
      expect(rule.check("TEST_VAR")).toBe(false);
    });

    test("should return true if Notion DB Id is a valid id", () => {
      process.env.TEST_VAR = "abcdefghijklmnopqrstuvwxyz123456";
      expect(rule.check("TEST_VAR")).toBe(true);
    });
  });

  describe("CommaSeparatedRule", () => {
    const policy = new CommaSeparatedRule();

    test("should return true if Category List is a comma-separated string", () => {
      process.env.TEST_VAR = "category1,category2,category3";
      expect(policy.check("TEST_VAR")).toBe(true);
    });

    test("should return true if Category List is a single category", () => {
      process.env.TEST_VAR = "category";
      expect(policy.check("TEST_VAR")).toBe(true);
    });

    test("should return true if Category List is multiple categories", () => {
      process.env.TEST_VAR = "category1,category2";
      expect(policy.check("TEST_VAR")).toBe(true);
    });

    test("should return true if Category List is multiple categories with spaces", () => {
      process.env.TEST_VAR = "category 1, category 2";
      expect(policy.check("TEST_VAR")).toBe(true);
    });

    test("should return true if Category List is multiple categories with spaces and commas", () => {
      process.env.TEST_VAR = "category 1, category 2, category 3";
      expect(policy.check("TEST_VAR")).toBe(true);
    });

    test("should return false for invalid category list", () => {
      process.env.TEST_VAR = "category1,,category3";
      expect(policy.check("TEST_VAR")).toBe(false);
    });
  });
});

describe("Environment Variable Policies", () => {
  afterEach(() => {
    delete process.env.TEST_VAR;
  });

  describe("NotionAuthPolicy", () => {
    const policy = new NotionAuthPolicy();

    test("should return false if Notion Auth is undefined", () => {
      delete process.env.TEST_VAR;
      expect(policy.checkNotionAuth("TEST_VAR")).toBe(false);
    });

    test("should return false if Notion Auth is an empty string", () => {
      process.env.TEST_VAR = "";
      expect(policy.checkNotionAuth("TEST_VAR")).toBe(false);
    });

    test("should return false if Notion Auth is not a valid secret", () => {
      process.env.TEST_VAR = "invalid_secret";
      expect(policy.checkNotionAuth("TEST_VAR")).toBe(false);
    });

    test("should return true if Notion Auth is a valid secret", () => {
      process.env.TEST_VAR =
        "secret_abcdefghijklmnopqrstuvwxyz4567890ABCDEFGHIJ";
      expect(policy.checkNotionAuth("TEST_VAR")).toBe(true);
    });
  });

  describe("NotionDBIdPolicy", () => {
    const policy = new NotionDBIdPolicy();

    test("should return false if Notion DB Id is undefined", () => {
      delete process.env.TEST_VAR;
      expect(policy.checkNotionDBId("TEST_VAR")).toBe(false);
    });

    test("should return false if Notion DB Id is an empty string", () => {
      process.env.TEST_VAR = "";
      expect(policy.checkNotionDBId("TEST_VAR")).toBe(false);
    });

    test("should return false if Notion DB Id is not a valid id", () => {
      process.env.TEST_VAR = "invalid_id";
      expect(policy.checkNotionDBId("TEST_VAR")).toBe(false);
    });

    test("should return true if Notion DB Id is a valid id", () => {
      process.env.TEST_VAR = "abcdefghijklmnopqrstuvwxyz123456";
      expect(policy.checkNotionDBId("TEST_VAR")).toBe(true);
    });
  });

  describe("CategoryListPolicy", () => {
    const policy = new CategoryListPolicy();

    test("should return false if Category List is undefined", () => {
      delete process.env.TEST_VAR;
      expect(policy.checkCategoryList("TEST_VAR")).toBe(false);
    });

    test("should return false if Category List is an empty string", () => {
      process.env.TEST_VAR = "";
      expect(policy.checkCategoryList("TEST_VAR")).toBe(false);
    });

    test("should return true if Category List is a comma-separated string", () => {
      process.env.TEST_VAR = "category1,category2,category3";
      expect(policy.checkCategoryList("TEST_VAR")).toBe(true);
    });

    test("should return true if Category List is a single category", () => {
      process.env.TEST_VAR = "category";
      expect(policy.checkCategoryList("TEST_VAR")).toBe(true);
    });

    test("should return true if Category List is multiple categories", () => {
      process.env.TEST_VAR = "category1,category2";
      expect(policy.checkCategoryList("TEST_VAR")).toBe(true);
    });

    test("should return true if Category List is multiple categories with spaces", () => {
      process.env.TEST_VAR = "category 1, category 2";
      expect(policy.checkCategoryList("TEST_VAR")).toBe(true);
    });

    test("should return true if Category List is multiple categories with spaces and commas", () => {
      process.env.TEST_VAR = "category 1, category 2, category 3";
      expect(policy.checkCategoryList("TEST_VAR")).toBe(true);
    });

    test("should return false for invalid category list", () => {
      process.env.TEST_VAR = "category1,,category3";
      expect(policy.checkCategoryList("TEST_VAR")).toBe(false);
    });
  });

  describe("DynamoDBTableNamePolicy", () => {
    const policy = new DynamoDBTableNamePolicy();

    test("should return false if DynamoDB Table Name is undefined", () => {
      delete process.env.TEST_VAR;
      expect(policy.checkDynamoDBTableName("TEST_VAR")).toBe(false);
    });

    test("should return false if DynamoDB Table Name is an empty string", () => {
      process.env.TEST_VAR = "";
      expect(policy.checkDynamoDBTableName("TEST_VAR")).toBe(false);
    });

    test("should return true if DynamoDB Table Name is a valid string", () => {
      process.env.TEST_VAR = "valid_table_name";
      expect(policy.checkDynamoDBTableName("TEST_VAR")).toBe(true);
    });
  });
});
