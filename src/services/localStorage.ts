import HighlightSource from "web-highlighter/dist/model/source";
import { Annotation } from "../types";
class AnnotationService {

    private readonly HIGHLIGHT_KEY = 'highlights';

    public getAnnotations(): HighlightSource[] {
        const highlightsString = localStorage.getItem(this.HIGHLIGHT_KEY);
        if (!highlightsString) {
            return [];
        }
        return JSON.parse(highlightsString);
    }

    public addAnnotations(highlight: HighlightSource): void {
        const highlights = this.getAnnotations();
        console.log("adding annotation to local storage" + highlight)
        highlights.push(highlight);
        localStorage.setItem(this.HIGHLIGHT_KEY, JSON.stringify(highlights));
    }

    public removeAnnotation(id: string): void {
        const highlights = this.getAnnotations().filter((highlight) => highlight.id !== id);
        localStorage.setItem(this.HIGHLIGHT_KEY, JSON.stringify(highlights));
    }
}

export default AnnotationService;
