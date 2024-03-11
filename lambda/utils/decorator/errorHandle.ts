import { AppError } from "../../error/appError";
import { UNKNOWN_ERROR_MESSAGE } from "../constant";
import { logger } from "../powertools";

export const errorHandle = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    logger.funcStart(propertyKey);

    let result: any;
    try {
      result = await originalMethod.apply(this, args);
      logger.funcEnd(propertyKey);
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new AppError(propertyKey, error.message);
      } else {
        throw new AppError(propertyKey, UNKNOWN_ERROR_MESSAGE);
      }
    } finally {
    }
  };
  return descriptor;
};
