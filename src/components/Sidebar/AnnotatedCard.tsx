import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  IconButton,
  Button,
} from "@material-tailwind/react";
import {AnnotationData} from "../../types";
interface AnnotationCardProps {
  annotationData: AnnotationData;
  onEdit: () => void;
  onDelete: () => void;
}
export default function AnnotatedCard({
  annotationData,
  onEdit,
  onDelete,
}: AnnotationCardProps) {
  const text = annotationData.annotation.text;
  const truncatedText =
    text.length > 100 ? text.substring(0, 100) + "..." : text;
  return (
    <Card className="mt-6 max-w-full w-70 border-solid border-4 border-black-500 overflow-hidden box-border">
      <CardBody className="overflow-y-auto">
        <blockquote
          className={`border-${annotationData.annotation.annotationTag} flex-grow border-l-4 pl-4 text-left`}
        >
          <p className="text text-gray-700 italic">
            <span className="block text-xl text-gray-500 mb-1">
              {annotationData.annotation.annotationTag}
            </span>
            {annotationData.annotation.text}
          </p>
        </blockquote>
        <div className="text-left">
          {annotationData.actionItems?.length ?? 0 > 0 ? (
            <div>{annotationData.actionItems?.length} action items</div>
          ) : null}
          {/* {annotationData.annotation.notes
            ? annotationData.annotation.notes
            : null} */}
        </div>
      </CardBody>
      <CardFooter className="pt-0">
        <div className="flex justify-between">
          {text.length > 100 ? (
            <Typography color="blue-gray">Read More</Typography>
          ) : null}
          <div className="flex space-x-2">
            <Button onClick={onEdit}>Edit</Button>

            <Button onClick={onDelete}>Delete</Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
