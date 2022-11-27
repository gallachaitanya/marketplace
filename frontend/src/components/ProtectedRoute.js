//import all the required libraries
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Store } from "../Store";

//function to check whether a user is logged in or not
export default function ProtectedRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo ? children : <Navigate to='/signin' />;
}
