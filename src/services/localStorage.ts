import HighlightSource from "web-highlighter/dist/model/source";
import { AnnotationData } from "../types";
class AnnotationService {

    private readonly HIGHLIGHT_KEY = 'highlights';

    public getAnnotations(): AnnotationData[] {
        const highlightsString = localStorage.getItem(this.HIGHLIGHT_KEY);
        if (!highlightsString) {
            return [];
        }
        return JSON.parse(highlightsString);
    }

    public getAnnotationsForUrl(url: string): AnnotationData[] {
        const highlights = this.getAnnotations();
        const annotations = highlights.filter((highlight) => highlight.annotation.url === url);
        console.log("annotations for url " + url + " are " + annotations)
        return annotations;
    }

    public addAnnotations(highlight: AnnotationData): void {
        const highlights = this.getAnnotations();
        console.log("adding annotation to local storage" + highlight)
        highlights.push(highlight);
        localStorage.setItem(this.HIGHLIGHT_KEY, JSON.stringify(highlights));
    }

    public removeAnnotation(id: string): void {
        const highlights = this.getAnnotations().filter((highlight) => highlight.annotation.id !== id);
        localStorage.setItem(this.HIGHLIGHT_KEY, JSON.stringify(highlights));
    }
}

export default AnnotationService;

// const mockAnnotation: AnnotationData[] = [
//     {

//     }]
