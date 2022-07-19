import React, {useEffect, useState} from 'react';
import styles from './Dashboard.module.css';
import { LoadingIcon } from './Icons';
import { getOrders } from './dataService';


const SellerRanking = React.memo(({ position, sellerName, sellerRevenue }) => {
  return (
    <>
      <td>{position}</td>
      <td>{sellerName}</td>
      <td>${sellerRevenue}</td>
    </>    
  );
});

const Dashboard = () => {
  const [orders, setOrders] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState (false);
  const [total, setTotal] = useState(0);

  const callFetchData = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    fetchData()
    .then(data => {
      sortNSet(data);
    })
    .catch(er => {
      console.log(er);
      sortNSet({});
    });
  };

  const calculateTotal = React.useCallback((data) => {
    var sum = 0;
    for( var el in data ) {
      if( data.hasOwnProperty( el ) ) {
        if(data[el].status === 'Confirmed')
          sum += parseFloat( data[el].revenue );
      }
    }
    setTotal(parseFloat(sum).toFixed(2));
    //return sum;
  }, []);

  const sortNSet = React.useCallback((data) => {
      console.log(data.length);
      if (data.length !== undefined) {
      // sort by revenue
      data.sort(function (a, b) {
        return b.revenue - a.revenue;
      });
      setOrders(data);
      setLoading(false);
      calculateTotal(data);
    } else {
      setOrders({});
      setError(true);
      setLoading(false);
      calculateTotal({});
    }
  }, [calculateTotal]);
  
  const fetchData = async () => await getOrders();  

  useEffect(() => {
    // make sure to catch any error
    setError(false);
    setLoading(true);
    fetchData()
    .then(data => {
      sortNSet(data);
    })
    .catch(er => {
      console.log(er);
      sortNSet({});
    });
  }, [sortNSet]);

  return (
    <div>
      <header className={styles.header}>        
        <h1>Top Sellers</h1>        
      </header>
      <main>
        {loading ? <LoadingIcon /> : ''}    
        {/* Place any data fetching errors inside this div, only render the div if there are errors */}
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>{error ? 'The request hast timed out, please try again.' : ''}</div>
          <button onClick={(e) => callFetchData(e)}>Retry</button>
        </div>
        <div>
          <p className={styles.summary}>
            <strong>Total revenue: </strong> 
            <span id="totalRevenue">${total}</span>
            </p>       
        </div>
        <h2>Seller Rankings</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Position</th>
              <th>Seller Name</th>
              <th>Seller Revenue</th>
            </tr>
          </thead>
          <tbody>
          {orders ? 
            (
              Object.keys(orders).map((k, idx) => {
                return (
                  <tr key={idx}>  
                    <SellerRanking position={orders[k].orderId} sellerName={orders[k].sellerName} sellerRevenue={orders[k].revenue} />
                  </tr>
                )
              })
            ) : ''
          }
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Dashboard;