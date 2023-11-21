import { AnnotationData } from "../types";
import config from "../config.json";

class AnnotationService {


    public async getAnnotations(): Promise<AnnotationData[]> {
        const highlights = await fetch(config.backend + "/api/annotation/all").then((res) => res.json());
        return highlights as AnnotationData[];
    }

    public async getAnnotationsForUrl(url: string): Promise<AnnotationData[]> {
        const highlights = await fetch(config.backend + "/api/annotation" + encodeURIComponent(url)).then((res) => res.json());
        return highlights as AnnotationData[];

    }

    public addAnnotations(highlight: AnnotationData): void {
        console.log(highlight)
        console.log("adding annotation")
        fetch(config.backend + "/api/annotation/", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }, body: JSON.stringify(highlight)

        })

    }

}

export default AnnotationService;