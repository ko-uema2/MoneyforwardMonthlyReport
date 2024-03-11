export type ExpenseData = {
  計算対象: boolean;
  日付: string;
  内容: string;
  "金額（円）": number;
  保有金融機関: string;
  大項目: string;
  中項目: string;
  メモ: string;
  振替: boolean;
  ID: string;
};

export type WriteDataType = {
  sumFood: number;
  sumHousing: number;
  sumDaily: number;
  sumSocial: number;
  sumSpecial: number;
  expensedDate: string;
};
