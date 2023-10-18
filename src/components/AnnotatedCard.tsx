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
    <Card className="mt-6 w-96 border-4 border-blue-500">
      <CardBody>
        <Typography>{truncatedText}</Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <div className="flex justify-between">
          {text.length > 100 ? (
            <Typography color="blue-gray">Read More</Typography>
          ) : null}
          <div>
            <IconButton
              color="light-blue"
              size="sm"
              onClick={onEdit}
              className="mr-2"
            >
              <Button> Edit</Button>
            </IconButton>
            <IconButton color="light-blue" size="sm" onClick={onDelete}>
              <Button> Delete</Button>
            </IconButton>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
