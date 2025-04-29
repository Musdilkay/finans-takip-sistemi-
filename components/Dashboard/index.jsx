import { Box } from '@adminjs/design-system'
import { useEffect, useState } from 'react'

const Dashboard = () => {
  const [data, setData] = useState({
    sales: 0,
    visitors: 0,
    earnings: 0,
    orders: 0,
  })

  useEffect(() => {
    // Geçici sabit veriler (backend'den çekebiliriz istersen sonra)
    setData({
      sales: 1504,
      visitors: 5049,
      earnings: 3200,
      orders: 230,
    })
  }, [])

  return (
    <Box style={{ padding: '20px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        <div style={{ backgroundColor: '#10b981', color: 'white', padding: '20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.sales}</div>
          <div>Sales</div>
        </div>
        <div style={{ backgroundColor: '#34d399', color: 'white', padding: '20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.visitors}</div>
          <div>Visitors</div>
        </div>
        <div style={{ backgroundColor: '#6ee7b7', color: 'white', padding: '20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>${data.earnings}</div>
          <div>Earnings</div>
        </div>
        <div style={{ backgroundColor: '#a7f3d0', color: 'white', padding: '20px', borderRadius: '10px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.orders}</div>
          <div>Orders</div>
        </div>
      </div>
    </Box>
  )
}

export default Dashboard
