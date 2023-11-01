import HighlightSource from 'web-highlighter/dist/model/source';
import { DomMeta } from '../node_modules/web-highlighter/dist/types';
export interface Annotation {
  startMeta: DomMeta;
  endMeta: DomMeta;
  text: string;
  id: string;
  url: string;
  AnnotationTag: AnnotationTag;
}

export type SideBarAction = "To-Dos" | "Notes"
export type AnnotationTag = "Strength" | "Weakness" | "Action Item" | "Confused" | "Other"

type ToDoActionCategory = "Futher Reading" | "Futher Practice" | "Contact Tutor" | "Refer Learning Resources" | "Explore Online" | "Other"

export interface AnnotationData {
  assignment?: Assignment;
  annotation: Annotation;
  notes?: AnnotationNotes
  todo?: AnnotationToDo
}

export interface AnnotationNotes {
  content: string;

}
export interface AnnotationToDo {
  todo: string;
  category: ToDoActionCategory;
  dueDate: Date;
}

export interface Feedback {
  feedback: string;
  annotations?: AnnotationData[];
  marker: string;


}
export interface Assignment {
  feedback: Feedback;
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