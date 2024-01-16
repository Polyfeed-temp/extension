
import axios from "./api.service";



export async function explainFuther(feedbackId: number, prompt: string) {
    const response = await axios.post(`/api/openai/explain/${feedbackId}`, { content: prompt }).then((res) => res.data);
    console.log("querying openai")
    return response.content as string;
}






