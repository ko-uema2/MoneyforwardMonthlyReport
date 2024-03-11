import { Segment, Subsegment } from "aws-xray-sdk-core";
import { tracer } from "./powertools";
import { AppError } from "../error/appError";
import { AWSXRAY_SEGMENT_ERROR_MESSAGE } from "./constant";
import { Context } from "aws-lambda";

const createSegment = (
  name: string,
  segment: Segment | Subsegment
): Subsegment => {
  const subSegment: Subsegment = segment.addNewSubsegment(`### ${name}`);
  return subSegment;
};

const closeSegment = (segment: Subsegment): void => {
  segment.close();
};

const initializeTracing = (
  name: string
): { segment: Segment | Subsegment; handlerSegment: Subsegment } => {
  const segment = tracer.getSegment();

  if (!segment) {
    throw new AppError(name, AWSXRAY_SEGMENT_ERROR_MESSAGE);
  }

  const handlerSegment = createSegment(name, segment);
  tracer.setSegment(handlerSegment);

  tracer.annotateColdStart();
  tracer.addServiceNameAnnotation();

  return { segment, handlerSegment };
};

export { initializeTracing, createSegment, closeSegment };
