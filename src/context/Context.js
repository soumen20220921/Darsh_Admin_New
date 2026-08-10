import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  //  const url = "https://api2.darshsaree.com"
   const url = "http://localhost:8001"

  const [tab, setTab] = useState(0);
  const [allProduct, setAllProduct] = useState(null);
  const [orders, setOrders] = useState(null);
  const [allUser, setAllUser] = useState(null);  

  // Function to fetch all products
  const getProduct = async () => {
    try {
      const res = await axios.get(`${url}/api/product/getallproduct`);
      setAllProduct(Array.isArray(res.data.products) ? res.data.products : []);
    } catch (error) {
      console.error("Error fetching products:", error.message);
      setAllProduct([]);
    }
  };

  // Function to fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${url}/api/payment/getallorders`);
      setOrders(Array.isArray(res.data.allOrders) ? res.data.allOrders : []);
    } catch (error) {
      console.error("Error fetching orders: " + error.message);
      setOrders([]);
    }
  };

   const getUsers = async () => {
    try {
      const res = await axios.get(`${url}/api/user/allusers`);
      setAllUser(Array.isArray(res.data.users) ? res.data.users : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUser([]);
    }
  };

  // Fetch all data on initial component mount
  useEffect(() => {
    getProduct();
    fetchOrders();
    getUsers();  
  }, []);

  return (
    <AppContext.Provider
      value={{
        tab,
        setTab,
        allProduct,
        getProduct,
        orders,
        fetchOrders,
        allUser,  
        getUsers,
        url  
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

 export const useAppContext = () => {
  return useContext(AppContext);
};