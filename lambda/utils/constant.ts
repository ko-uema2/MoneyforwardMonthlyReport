const NOTION_AUTH_KEY = process.env["NOTION_AUTH"]!;
const NOTION_DB_ID_KEY = process.env["NOTION_DB_ID"]!;
const CATEGORY_LIST_KEY = process.env["CATEGORY_LIST"]!;
const DYNAMO_DB_TABLE_NAME_KEY = process.env["DYNAMO_DB_TABLE_NAME"]!;

const S3_OBJECT_NOT_FOUND =
  "s3バケットから指定のファイルを取得できませんでした";
const UNKNOWN_ERROR_MESSAGE = "想定外のエラーが発生しました";
const APPLICATION_ERROR_MESSAGE = "アプリケーションエラーが発生しました";
const AWSXRAY_SEGMENT_ERROR_MESSAGE = "X-Rayのセグメント取得に失敗しました";

export {
  NOTION_AUTH_KEY,
  NOTION_DB_ID_KEY,
  CATEGORY_LIST_KEY,
  DYNAMO_DB_TABLE_NAME_KEY,
  S3_OBJECT_NOT_FOUND,
  UNKNOWN_ERROR_MESSAGE,
  APPLICATION_ERROR_MESSAGE,
  AWSXRAY_SEGMENT_ERROR_MESSAGE,
};
