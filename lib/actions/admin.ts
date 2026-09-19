"use server"

import pool from "@/lib/db"
import type { RowDataPacket } from "mysql2"

export async function getAdminStats() {
  try {
    const [[revenueResult]] = await pool.execute<RowDataPacket[]>(
      "SELECT SUM(total_fare) as total_revenue FROM rides WHERE status = 'completed'"
    )
    
    const [[commissionResult]] = await pool.execute<RowDataPacket[]>(
      "SELECT SUM(commission_amount) as total_commission FROM driver_earnings"
    )

    const [[ridesResult]] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total_rides FROM rides"
    )

    const [[clientsResult]] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total_clients FROM clients"
    )

    const [[driversResult]] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as total_drivers FROM drivers"
    )

    return {
      totalRevenue: revenueResult?.total_revenue || 0,
      totalCommission: commissionResult?.total_commission || 0,
      totalRides: ridesResult?.total_rides || 0,
      totalClients: clientsResult?.total_clients || 0,
      totalDrivers: driversResult?.total_drivers || 0,
    }
  } catch (error) {
    console.error("Admin stats error:", error)
    return {
      totalRevenue: 0,
      totalCommission: 0,
      totalRides: 0,
      totalClients: 0,
      totalDrivers: 0,
    }
  }
}

export async function getAdminRides() {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT r.*, c.full_name as client_name, d.full_name as driver_name 
       FROM rides r 
       LEFT JOIN clients c ON r.client_id = c.user_id 
       LEFT JOIN drivers d ON r.driver_id = d.id 
       ORDER BY r.requested_at DESC 
       LIMIT 50`
    )
    return rows
  } catch (error) {
    console.error("Admin rides error:", error)
    return []
  }
}

export async function getAdminUsers() {
  try {
    const [clients] = await pool.execute<RowDataPacket[]>(
      "SELECT user_id as id, full_name, phone, 'client' as role, created_at, is_blocked FROM clients ORDER BY created_at DESC LIMIT 50"
    )
    const [drivers] = await pool.execute<RowDataPacket[]>(
      "SELECT id, full_name, phone, 'driver' as role, created_at, IF(is_available=1, 'online', 'offline') as status, is_blocked, is_verified FROM drivers ORDER BY created_at DESC LIMIT 50"
    )
    return { clients, drivers }
  } catch (error) {
    console.error("Admin users error:", error)
    return { clients: [], drivers: [] }
  }
}

export async function deleteUser(id: string, role: string) {
  try {
    if (role === "client") {
      await pool.execute("DELETE FROM clients WHERE user_id = ?", [id])
    } else {
      await pool.execute("DELETE FROM drivers WHERE id = ?", [id])
    }
    return { success: true }
  } catch (error) {
    console.error("Delete user error:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function toggleBlockUser(id: string, role: string, currentlyBlocked: boolean) {
  try {
    const newValue = currentlyBlocked ? 0 : 1
    if (role === "client") {
      await pool.execute("UPDATE clients SET is_blocked = ? WHERE user_id = ?", [newValue, id])
    } else {
      await pool.execute("UPDATE drivers SET is_blocked = ? WHERE id = ?", [newValue, id])
    }
    return { success: true }
  } catch (error) {
    console.error("Toggle block error:", error)
    return { success: false, error: "Failed to update status" }
  }
}

export async function toggleVerifyDriver(id: string, currentlyVerified: boolean) {
  try {
    const newValue = currentlyVerified ? 0 : 1
    await pool.execute("UPDATE drivers SET is_verified = ? WHERE id = ?", [newValue, id])
    return { success: true }
  } catch (error) {
    console.error("Toggle verify error:", error)
    return { success: false, error: "Failed to verify driver" }
  }
}
