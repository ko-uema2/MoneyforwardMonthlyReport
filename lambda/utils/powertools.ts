import { Tracer } from "@aws-lambda-powertools/tracer";
import { cumtomLogger } from "./logger";

const logger = new cumtomLogger();
const tracer = new Tracer();

export { logger, tracer };
