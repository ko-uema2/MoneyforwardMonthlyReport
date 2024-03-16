import { Context, S3Event } from "aws-lambda";
import { AppError } from "./error/appError";
import {
  APPLICATION_ERROR_MESSAGE,
  UNKNOWN_ERROR_MESSAGE,
} from "./utils/constant";
import { logger } from "./utils/powertools";
import { EnvContext, EnvVar, strategyMap } from "./utils/strategy/envStrategy";
import { S3EventExtractor } from "./s3EventExtractor";
import { SSMParameterFetcher } from "./ssm";
import { Notion } from "./notion";
import { ExpenseDataExtractor } from "./expenseDataExtractor";
import { ExpenseCalculator } from "./expenseCalculator";

class Handler {
  private s3EventExtractor: S3EventExtractor;
  private notion: Notion;
  private requiredEnvVars: { [key: string]: string | undefined };

  constructor() {}

  private async init(): Promise<void> {
    // SSMから各種環境変数を取得
    const ssm = new SSMParameterFetcher();
    this.requiredEnvVars = await ssm.getParameters();

    // ガード節
    const invalidEnvVars: { [key: string]: string | undefined } = {};
    for (const [key, value] of Object.entries(this.requiredEnvVars)) {
      const envVarStrategy = strategyMap[key as EnvVar];
      if (!envVarStrategy) {
        throw new AppError(Handler.name, `strategy not found: ${key}`);
      }

      const envVarContext = new EnvContext(envVarStrategy);
      if (!envVarContext.executeStrategy(value)) {
        invalidEnvVars[key] = value;
      }
    }
    if (Object.keys(invalidEnvVars).length > 0) {
      throw new AppError(
        Handler.name,
        `environment variables are invalid: ${Object.keys(invalidEnvVars).join(
          ", "
        )}`
      );
    }

    this.notion = new Notion({
      NOTION_AUTH: this.requiredEnvVars.NOTION_AUTH!,
      NOTIONDB_ID: this.requiredEnvVars.NOTIONDB_ID!,
    });
  }

  public async handleEvent(event: S3Event, context: Context): Promise<void> {
    logger.funcStart(Handler.name);
    logger.info("Lambda invocation event", { event });

    await this.init();

    this.s3EventExtractor = new S3EventExtractor(event);

    try {
      // 支出の分類名を配列に格納
      const categoryListArray: string[] =
        this.requiredEnvVars.CATEGORY_LIST!.split(",");

      const shiftJISByteArray = await this.s3EventExtractor.getCSVContents();
      const csvContents = new TextDecoder("shift-jis").decode(
        shiftJISByteArray
      );
      const extractor = new ExpenseDataExtractor(csvContents);
      const { jsonExpenseDataArray, expensedDate } = await extractor.extract();

      // 支出データを集計
      const sumByCategory = new ExpenseCalculator(
        categoryListArray,
        jsonExpenseDataArray
      ).sumByCategory();

      // notionへ書き込み
      await this.notion.writeDB(sumByCategory, expensedDate);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        logger.error(APPLICATION_ERROR_MESSAGE, error);
      } else {
        logger.error(UNKNOWN_ERROR_MESSAGE, error as Error);
      }
    } finally {
      logger.funcEnd(Handler.name);
    }
  }
}

const handlerInstance = new Handler();
export const handler = (event: S3Event, context: Context) =>
  handlerInstance.handleEvent(event, context);
