
import axios from "./api.service";


class OpenAIService {
    public async explainFuther(prompt: string) {
        const response = await axios.post("/api/openai/explain", { content: prompt }).then((res) => res.data);
        console.log("querying openai")
        return response as string;
    }




}

export default OpenAIService