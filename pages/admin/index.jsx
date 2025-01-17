import React, { useState } from 'react'
import styles from "../../styles/Admin.module.css"
import Image from "next/image"
import axios from 'axios'
import AddButton from '../../components/AddButton'
import Add from '../../components/Add'

const Index = ({ orders, products }) => {

    const [foodList, setFoodList] = useState(products);
    const [orderList, setOrderList] = useState(orders);

    const [close, setClose] = useState(true);

    const status = ["preparing", "on the way", "delivered"]

    const handleDelete = async (id) => {
        try{
            await axios.delete("http://localhost:3000/api/products/"+ id);
            setFoodList(foodList.filter(food => food._id !== id));
        }catch (err) {
            console.log(err)
        }
    }

    const handleStatus = async (id) => {

        const item = orderList.filter(order => order._id === id)[0]

        const currentStatus = item.status
        try {
            const res = await axios.put("http://localhost:3000/api/orders/" + id, {status: currentStatus + 1})

            setOrderList([
                res.data,
                ...orderList.filter(order => order._id !== id),
            ])
        } catch(err) {
            console.log(err)
        }
    }
  return (
    <div className={styles.container}>
        <div className={styles.item}>
            <h1 className={styles.title}>Products</h1>

            <table className={styles.table}>
                <tbody>
                    <tr className={styles.trTitle}>
                        <th>Image</th>
                        <th>Id</th>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Action</th>
                    </tr>
                </tbody>
                {foodList.map((product) => (
                    <tbody key={product._id}>

                        <tr className={styles.trTitle}>
                            <td><Image
                                    src={product.img}
                                    width={50}
                                    height={50}
                                    objectFit="cover"
                                    alt=""
                                /></td>
                            <td>{product._id.slice(0,5)}...</td>
                            <td>{product.title}</td>
                            <td>{product.prices[0]}</td>
                            <td> 
                                <button className={styles.button}>Edit</button>
                                <button onClick={() => handleDelete(product._id)} className={styles.button}>Delete</button>
                            </td>
                        </tr>
                    </tbody>
                ))}
            </table>
            <AddButton setClose={setClose} />
            {!close && <Add setClose={setClose} />}
        </div>
        <div className={styles.item}>
            <h1 className={styles.title}>Orders</h1>

            <table className={styles.table}>
                <tbody>
                    <tr className={styles.trTitle}>
                        <th>Id</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Total Price</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </tbody>

                {orderList.map((order) => (
                    
                    <tbody key={order._id}>
                    <tr className={styles.trTitle}>
                        <td>{order._id.slice(0,5)}...</td>
                        <td>{order.customer}</td>
                        <td>{order.phone}</td>
                        <td>N{order.total}</td>
                        <td>{order.method === 0 ? (<span>cash</span>) : (<span>paid</span>)}</td>
                        <td>{status[order.status]}</td>
                        <td>
                            <button onClick={() => handleStatus(order._id)} className={styles.button}>Next </button>
                        </td>
                    </tr>
                    </tbody>
                ))}
            </table>
        </div>
    </div>
  )
}

export const getServerSideProps = async (ctx) => {
    const myCookie = ctx.req?.cookies || "";

    if(myCookie.token !== process.env.TOKEN){
        return{
            redirect:{
                destination: "/admin/login",
                permanent: false,
            }
        }
    }
    const productRes = await axios.get("http://localhost:3000/api/products");

    const orderRes = await axios.get("http://localhost:3000/api/orders");

    return {
        props: {
            orders: orderRes.data,
            products: productRes.data
        }
    }

}

export default Index

