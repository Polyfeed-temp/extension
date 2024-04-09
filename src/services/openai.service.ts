import axios from "./api.service";

export async function explainFuther(
  feedbackId: number,
  prompt: string,
  attemptTime = 1
) {
  const response = await axios
    .post(`/api/openai/explain/${feedbackId}`, {
      content: prompt,
      attemptTime,
    })
    .then((res) => res.data);
  return response.content as string;
}
