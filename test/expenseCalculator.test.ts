import { ExpenseCalculator } from "../lambda/expenseCalculator";
import { ExpenseData } from "../lambda/type/type";

describe("expenseCalculator", () => {
  let expenseCalculator: ExpenseCalculator;

  beforeEach(() => {
    const categoryListArray = [
      "1. 定期・固定費",
      "2. 定期・変動費",
      "3. 不定期・固定費",
      "4. 不定期・変動費",
    ];
    const validExpenseDataArray: ExpenseData[] = [
      {
        計算対象: true,
        日付: "",
        内容: "",
        保有金融機関: "",
        大項目: "",
        中項目: "1. サブスク",
        メモ: "",
        振替: false,
        ID: "",
        "金額（円）": 100,
      },
      {
        計算対象: true,
        日付: "",
        内容: "",
        保有金融機関: "",
        大項目: "",
        中項目: "2. コンビニ",
        メモ: "",
        振替: false,
        ID: "",
        "金額（円）": 200,
      },
      {
        計算対象: true,
        日付: "",
        内容: "",
        保有金融機関: "",
        大項目: "",
        中項目: "3. 年会費",
        メモ: "",
        振替: false,
        ID: "",
        "金額（円）": 300,
      },
      {
        計算対象: true,
        日付: "",
        内容: "",
        保有金融機関: "",
        大項目: "",
        中項目: "4. 旅行",
        メモ: "",
        振替: false,
        ID: "",
        "金額（円）": 400,
      },
      {
        計算対象: true,
        日付: "",
        内容: "",
        保有金融機関: "",
        大項目: "",
        中項目: "1. サブスク",
        メモ: "",
        振替: false,
        ID: "",
        "金額（円）": 500,
      },
      {
        計算対象: true,
        日付: "",
        内容: "",
        保有金融機関: "",
        大項目: "",
        中項目: "2. 交通費",
        メモ: "",
        振替: false,
        ID: "",
        "金額（円）": 600,
      },
      {
        計算対象: true,
        日付: "",
        内容: "",
        保有金融機関: "",
        大項目: "",
        中項目: "3. 年会費",
        メモ: "",
        振替: false,
        ID: "",
        "金額（円）": 700,
      },
      {
        計算対象: true,
        日付: "",
        内容: "",
        保有金融機関: "",
        大項目: "",
        中項目: "4. 家電",
        メモ: "",
        振替: false,
        ID: "",
        "金額（円）": 800,
      },
    ];

    expenseCalculator = new ExpenseCalculator(
      categoryListArray,
      validExpenseDataArray
    );
  });

  describe("sumByCategory", () => {
    test("should return sum by category", () => {
      const result = expenseCalculator.sumByCategory();
      expect(result).toEqual({
        "1. 定期・固定費": 600,
        "2. 定期・変動費": 800,
        "3. 不定期・固定費": 1000,
        "4. 不定期・変動費": 1200,
      });
    });
  });
});
