import { AnnotationData } from "../types";
import axios from "./api.service";


class AnnotationService {


    public async getAnnotations(): Promise<AnnotationData[]> {
        const highlights = await axios.get("/api/annotation").then((res) => res.data);
        return highlights as AnnotationData[];
    }

    public async getAnnotationsForUrl(url: string): Promise<AnnotationData[]> {
        const highlights = await axios.get("/api/annotation" + encodeURIComponent(url)).then((res) => res.data);
        return highlights as AnnotationData[];

    }

    public addAnnotations(highlight: AnnotationData): void {
        console.log(highlight)
        console.log("adding annotation")
        axios.post("/api/annotation/", {
            headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify(highlight)

        })

    }

}

export default AnnotationService;