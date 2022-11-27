//import the required libraries
import Alert from "react-bootstrap/Alert";

//function component to display a box message
export default function BoxMessage(props) {
  return <Alert variant={props.variant || "info"}>{props.children}</Alert>;
}
