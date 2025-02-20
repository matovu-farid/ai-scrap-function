import { generateText } from "ai";
import { getS3Key, setData } from "./entites/s3";
import { openai } from "@ai-sdk/openai";
import { publish } from "./entites/sns";
import { getContent } from "./utils/content";
import { ScrapResult } from "./schemas/scrapResult";

export const scrape = async (host: string, prompt: string) => {
  const content = await getContent(host);

  if (!content) {
    return null;
  }

  const textData = JSON.stringify(content);

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "You are provided with a list of urls and their content. You are to extract the key details from the content and reply to the prompt from the user in a clear meaningful way.",
    prompt: `<Prompt>
      ${prompt}
      </Prompt>
      <Details>
      ${textData}
      </Details>`,
  });
  await setData(`scraped-data/${getS3Key(host)}`, text);
  await publish<ScrapResult>(process.env.SCRAPE_TOPIC_ARN || "", {
    host,
  });

  return text;
};
