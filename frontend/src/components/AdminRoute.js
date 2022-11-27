//import all the required libraries
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Store } from "../Store";

//function to check whether an user is admin or not
export default function AdminRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  return userInfo && userInfo.isAdmin ? children : <Navigate to='/signin' />;
}
