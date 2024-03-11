import { Logger } from "@aws-lambda-powertools/logger";

export class cumtomLogger extends Logger {
  funcStart(funcName: string) {
    const logMessage = `start: ${funcName}`;
    super.debug(logMessage);
  }

  funcEnd(funcName: string) {
    const logMessage = `end  : ${funcName}`;
    super.debug(logMessage);
  }
}
