//import all the required libraries
import Spinner from "react-bootstrap/Spinner";

//function to display a loadingbox
export default function LoadingBox() {
  return (
    <Spinner animation='border' role='status'>
      <span className='visually-hidden'>Loading...</span>
    </Spinner>
  );
}
