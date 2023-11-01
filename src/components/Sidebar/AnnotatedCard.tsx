import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  IconButton,
  Button,
} from "@material-tailwind/react";
interface AnnotationCardProps {
  text: string;
  onEdit: () => void;
  onDelete: () => void;
}
export default function AnnotatedCard({
  text,
  onEdit,
  onDelete,
}: AnnotationCardProps) {
  const truncatedText =
    text.length > 100 ? text.substring(0, 100) + "..." : text;

  return (
    <Card className="mt-6 max-w-full w-70 border-solid border-4 border-black-500 overflow-hidden box-border">
      <CardBody className="overflow-y-auto">
        <Typography className="break-words">{truncatedText}</Typography>
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
