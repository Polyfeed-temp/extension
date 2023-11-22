import HighlightSource from 'web-highlighter/dist/model/source';
import { DomMeta } from '../node_modules/web-highlighter/dist/types';
export interface Annotation {
  startMeta: DomMeta;
  endMeta: DomMeta;
  text: string;
  id: string;
  url: string;
  annotationTag: AnnotationTag;
}

export type SideBarAction = "To-Dos" | "Notes"
export type AnnotationTag = "Strength" | "Weakness" | "Action Item" | "Confused" | "Other"

export type ActionPointCategory =
  | "Further Practice"
  | "Contact Tutor"
  | "Ask Classmate"
  | "Refer Learning Resources"
  | "Explore Online"
  | "Other";

export interface AnnotationData {
  unitCode?: string;
  assignmentName?: string;
  annotation: Annotation;
  notes?: AnnotationNotes
  todo?: AnnotationActionPoint[]
}

export interface AnnotationNotes {
  content: string;

}
export interface AnnotationActionPoint {
  action: string;
  actionpoint: ActionPointCategory;
  deadline: Date;
  completed: boolean;
}

export interface Feedback {
  feedback: string;
  annotations?: AnnotationData[];
  marker: string;


}
export interface Assignment {
  feedback?: Feedback;
  assignmentName: string;
  rubric: string;

}

export interface Unit {
  unitCode: string;
  assignments: Assignment[];

}

export interface User {
  name: string;
  units: Unit[];
}