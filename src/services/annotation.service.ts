import { AnnotationData, Feedback } from "../types";
import axios from "./api.service";


class AnnotationService {


    public async getAnnotations(): Promise<AnnotationData[]> {
        const highlights = await axios.get("/api/annotation").then((res) => res.data);
        return highlights as AnnotationData[];
    }

    public async getCurrentPageFeedback(): Promise<Feedback | null> {
        try {
            const highlights = await axios.get("/api/annotation").then((res) => res.data);
            return highlights as Feedback
        }
        catch (error) {
            console.log(error)
            return null
        }


    }

    public addAnnotations(assessmentID: number, highlight: AnnotationData): void {

        console.log(highlight)
        console.log("adding annotation")
        axios.post("/api/annotation/", {
            headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify(highlight)

        })

    }
    public async createFeedback(feedback: Feedback): Promise<Feedback> {
        const response = await axios.post("/api/feedback/", feedback)
        return response.data as Feedback
    }


}

export default AnnotationService;