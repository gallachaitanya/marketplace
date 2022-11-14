import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import { useReducer } from "react";
import Col from "react-bootstrap/esm/Col";
import Row from "react-bootstrap/esm/Row";
import { Link, useNavigate, useParams } from "react-router-dom";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import Form from "react-bootstrap/Form";
import Rating from "../components/Rating";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/esm/Button";
import { Helmet } from "react-helmet-async";
import { getError } from "../utils";
import LoadingBox from "../components/LoadingBox";
import BoxMessage from "../components/BoxMessage";
import { Store } from "../Store";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import { toast } from "react-toastify";

const reducer = (state, action) => {
  switch (action.type) {
    case "REFRESH_PRODUCT":
      return { ...state, product: action.payload };
    case "CREATE_REQUEST":
      return { ...state, loadingCreateReview: true };
    case "CREATE_SUCCESS":
      return { ...state, loadingCreateReview: false };
    case "CREATE_FAIL":
      return { ...state, loadingCreateReview: false };
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return { ...state, product: action.payload, loading: false };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function ProductScreen() {
  let reviewsRef = useRef();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState("");

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
      product: [],
    });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert("Sorry, Product is out of stock");
      return;
    }
    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...product, quantity: 1 },
    });
    navigate("/cart");
  };

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "FETCH_REQUEST" });
      try {
        const result = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error("Please enter comment and rating");
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({
        type: "CREATE_SUCCESS",
      });
      toast.success("Review submitted successfully");
      product.reviews.unshift(data.review);
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: "REFRESH_PRODUCT", payload: product });
      window.scrollTo({
        behavior: "smooth",
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: "CREATE_FAIL" });
    }
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <BoxMessage variant='danger'>{error}</BoxMessage>
  ) : (
    <div>
      <Row>
        <Col md={6}>
          <img
            className='img-large'
            src={selectedImage || product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant='flush'>
            <ListGroupItem>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroupItem>
            <ListGroupItem>
              <Rating rating={product.rating} numReviews={product.numReviews} />
            </ListGroupItem>
            <ListGroup.Item>
              <Row xs={1} md={2} className='g-2'>
                {[product.image, ...product.images].map((x) => (
                  <Col key={x}>
                    <Card>
                      <Button
                        className='thumbnail'
                        type='button'
                        variant='light'
                        onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant='top' src={x} alt='product' />
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ListGroup.Item>
            <ListGroupItem>
              Description:
              <p>{product.description}</p>
            </ListGroupItem>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup>
                <ListGroupItem>
                  <Row>
                    <Col>Price:</Col>
                    <Col>${product.price}</Col>
                  </Row>
                </ListGroupItem>
                <ListGroupItem>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg='success'>In stock</Badge>
                      ) : (
                        <Badge bg='danger'>Unavailable</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroupItem>
                {product.countInStock > 0 && (
                  <ListGroupItem>
                    <div className='d-grid'>
                      <Button onClick={addToCartHandler} variant='primary'>
                        Add to Cart
                      </Button>
                    </div>
                  </ListGroupItem>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className='my-3'>
        <h2 ref={reviewsRef}>Reviews</h2>
        <div className='mb-3'>
          {product.reviews.length === 0 && (
            <BoxMessage>There is no review</BoxMessage>
          )}
        </div>
        <ListGroup>
          {product.reviews.map((review) => (
            <ListGroup.Item key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} caption=' '></Rating>
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className='my-3'>
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Write a customer review</h2>
              <Form.Group className='mb-3' controlId='rating'>
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  aria-label='Rating'
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value=''>Select...</option>
                  <option value='1'>1- Poor</option>
                  <option value='2'>2- Fair</option>
                  <option value='3'>3- Good</option>
                  <option value='4'>4- Very good</option>
                  <option value='5'>5- Excelent</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel
                controlId='floatingTextarea'
                label='Comments'
                className='mb-3'
              >
                <Form.Control
                  as='textarea'
                  placeholder='Leave a comment here'
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </FloatingLabel>

              <div className='mb-3'>
                <Button disabled={loadingCreateReview} type='submit'>
                  Submit
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <BoxMessage>
              Please{" "}
              <Link to={`/signin?redirect=/product/${product.slug}`}>
                Sign In
              </Link>{" "}
              to write a review
            </BoxMessage>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductScreen;
