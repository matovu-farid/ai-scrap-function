import { getSigniture } from "./getSigniture";
import type { WebHookEvent, WebHookEventData } from "./webHooks";
import { publish } from "@/entites/sns";

/**
 * Publish a webhook event to the SNS topic
 * @param webhook - The webhook to publish to
 * @param data - The data to publish
 * @param headers - The headers to publish
 */

export async function publishWebhook(
  webhook: string,
  data: WebHookEventData,
  signSecret: string
) {
  const timestamp = new Date().toISOString();
  const signature = getSigniture(data, signSecret);
  const webhookEvent = {
    webhook,
    data,
    headers: {
      "Content-Type": "application/json",
      "x-webhook-signature": signature,
      "x-webhook-timestamp": timestamp,
    },
  } as WebHookEvent;
  await publish<WebHookEvent>(process.env.WEBHOOK_TOPIC_ARN!, webhookEvent);
}
