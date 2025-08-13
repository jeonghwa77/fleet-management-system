import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// 차량 관련 API
app.get('/make-server-ed545625/vehicles', async (c) => {
  try {
    const vehicles = await kv.getByPrefix('vehicle:')
    return c.json({ success: true, data: vehicles })
  } catch (error) {
    console.log('Error fetching vehicles:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/make-server-ed545625/vehicles', async (c) => {
  try {
    const vehicleData = await c.req.json()
    const vehicleId = `vehicle:${Date.now()}`
    await kv.set(vehicleId, vehicleData)
    return c.json({ success: true, id: vehicleId, data: vehicleData })
  } catch (error) {
    console.log('Error creating vehicle:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.put('/make-server-ed545625/vehicles/:id', async (c) => {
  try {
    const vehicleId = `vehicle:${c.req.param('id')}`
    const vehicleData = await c.req.json()
    await kv.set(vehicleId, vehicleData)
    return c.json({ success: true, data: vehicleData })
  } catch (error) {
    console.log('Error updating vehicle:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.delete('/make-server-ed545625/vehicles/:id', async (c) => {
  try {
    const vehicleId = `vehicle:${c.req.param('id')}`
    await kv.del(vehicleId)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting vehicle:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 예약 관련 API
app.get('/make-server-ed545625/reservations', async (c) => {
  try {
    const reservations = await kv.getByPrefix('reservation:')
    return c.json({ success: true, data: reservations })
  } catch (error) {
    console.log('Error fetching reservations:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/make-server-ed545625/reservations', async (c) => {
  try {
    const reservationData = await c.req.json()
    const reservationId = `reservation:${Date.now()}`
    const reservation = {
      ...reservationData,
      id: reservationId,
      status: reservationData.status || 'approved', // 기본적으로 승인됨으로 설정
      createdAt: new Date().toISOString()
    }
    
    // 승인된 예약이면 차량 상태를 예약중으로 변경
    if (reservation.status === 'approved') {
      const vehicleId = `vehicle:${reservationData.vehicleId}`
      const vehicle = await kv.get(vehicleId)
      if (vehicle) {
        await kv.set(vehicleId, { ...vehicle, status: 'reserved' })
      }
    }
    await kv.set(reservationId, reservation)
    return c.json({ success: true, id: reservationId, data: reservation })
  } catch (error) {
    console.log('Error creating reservation:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.put('/make-server-ed545625/reservations/:id', async (c) => {
  try {
    const reservationId = `reservation:${c.req.param('id')}`
    const reservationData = await c.req.json()
    
    // 기존 예약 데이터 가져오기
    const existingReservation = await kv.get(reservationId)
    if (!existingReservation) {
      return c.json({ success: false, error: 'Reservation not found' }, 404)
    }
    
    const updatedReservation = {
      ...existingReservation,
      ...reservationData,
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(reservationId, updatedReservation)
    return c.json({ success: true, data: updatedReservation })
  } catch (error) {
    console.log('Error updating reservation:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.delete('/make-server-ed545625/reservations/:id', async (c) => {
  try {
    const reservationId = `reservation:${c.req.param('id')}`
    await kv.del(reservationId)
    return c.json({ success: true })
  } catch (error) {
    console.log('Error deleting reservation:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 예약 상태 업데이트
app.patch('/make-server-ed545625/reservations/:id/status', async (c) => {
  try {
    const reservationId = `reservation:${c.req.param('id')}`
    const { status } = await c.req.json()
    
    const existingReservation = await kv.get(reservationId)
    if (!existingReservation) {
      return c.json({ success: false, error: 'Reservation not found' }, 404)
    }
    
    const updatedReservation = {
      ...existingReservation,
      status,
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(reservationId, updatedReservation)
    
    // 차량 상태도 업데이트 (예약 승인시 차량을 예약중으로 변경)
    if (status === 'approved') {
      const vehicleId = `vehicle:${existingReservation.vehicleId}`
      const vehicle = await kv.get(vehicleId)
      if (vehicle) {
        await kv.set(vehicleId, { ...vehicle, status: 'reserved' })
      }
    } else if (status === 'cancelled' || status === 'completed') {
      const vehicleId = `vehicle:${existingReservation.vehicleId}`
      const vehicle = await kv.get(vehicleId)
      if (vehicle) {
        await kv.set(vehicleId, { ...vehicle, status: 'available' })
      }
    }
    
    return c.json({ success: true, data: updatedReservation })
  } catch (error) {
    console.log('Error updating reservation status:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 초기 데이터 설정
app.post('/make-server-ed545625/initialize', async (c) => {
  try {
    // 기본 차량 데이터 생성
    const vehicles = [
      {
        id: '1',
        name: '아반떼',
        type: '승용차',
        plateNumber: '12가 3456',
        capacity: 5,
        status: 'available',
        fuelType: '휘발유'
      },
      {
        id: '2',
        name: '그랜저',
        type: '승용차',
        plateNumber: '34나 5678',
        capacity: 5,
        status: 'available',
        fuelType: '휘발유'
      },
      {
        id: '3',
        name: '스타렉스',
        type: '승합차',
        plateNumber: '56다 7890',
        capacity: 12,
        status: 'available',
        fuelType: '디젤'
      },
      {
        id: '4',
        name: '포터',
        type: '화물차',
        plateNumber: '78라 9012',
        capacity: 3,
        status: 'maintenance',
        fuelType: '디젤'
      }
    ]
    
    for (const vehicle of vehicles) {
      await kv.set(`vehicle:${vehicle.id}`, vehicle)
    }
    
    return c.json({ success: true, message: 'Initial data created successfully' })
  } catch (error) {
    console.log('Error initializing data:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 헬스 체크
app.get('/make-server-ed545625/health', (c) => {
  return c.json({ 
    success: true, 
    status: 'healthy',
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    connected: true
  })
})

Deno.serve(app.fetch)