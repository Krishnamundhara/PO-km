import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const DataContext = createContext({})

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}

export const DataProvider = ({ children }) => {
  const { user } = useAuth()

  const [mills, setMills] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [qualityRecords, setQualityRecords] = useState([])
  const [companyDetails, setCompanyDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch all data
  const fetchData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch from Supabase
      const [millsRes, productsRes, customersRes, posRes, qualityRes, companyRes] = await Promise.all([
        supabase.from('mills').select('*').eq('user_id', user.id),
        supabase.from('products').select('*').eq('user_id', user.id),
        supabase.from('customers').select('*').eq('user_id', user.id),
        supabase.from('purchase_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('quality_records').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('company_details').select('*').eq('user_id', user.id).single()
      ])

      setMills(millsRes.data || [])
      setProducts(productsRes.data || [])
      setCustomers(customersRes.data || [])
      setPurchaseOrders(posRes.data || [])
      setQualityRecords(qualityRes.data || [])
      setCompanyDetails(companyRes.data || null)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // CRUD operations
  const addMill = async (mill) => {
    const { data, error } = await supabase
      .from('mills')
      .insert({ ...mill, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setMills([...mills, data])
  }

  const updateMill = async (id, updates) => {
    const { error } = await supabase
      .from('mills')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setMills(mills.map(m => m.id === id ? { ...m, ...updates } : m))
  }

  const deleteMill = async (id) => {
    const { error} = await supabase
      .from('mills')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setMills(mills.filter(m => m.id !== id))
  }

  const addProduct = async (product) => {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setProducts([...products, data])
  }

  const updateProduct = async (id, updates) => {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deleteProduct = async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setProducts(products.filter(p => p.id !== id))
  }

  const addCustomer = async (customer) => {
    const { data, error } = await supabase
      .from('customers')
      .insert({ ...customer, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setCustomers([...customers, data])
  }

  const updateCustomer = async (id, updates) => {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setCustomers(customers.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteCustomer = async (id) => {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setCustomers(customers.filter(c => c.id !== id))
  }

  const addPurchaseOrder = async (po) => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert({ ...po, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setPurchaseOrders([data, ...purchaseOrders])
  }

  const updatePO = async (id, updates) => {
    const { error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setPurchaseOrders(purchaseOrders.map(po => po.id === id ? { ...po, ...updates } : po))
  }

  const deletePO = async (id) => {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setPurchaseOrders(purchaseOrders.filter(po => po.id !== id))
  }

  const updateCompanyDetails = async (details) => {
    try {
      // First, try to get existing company details
      const { data: existing } = await supabase
        .from('company_details')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('company_details')
          .update(details)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase
          .from('company_details')
          .insert({ ...details, user_id: user.id })
        if (error) throw error
      }
      setCompanyDetails(details)
    } catch (error) {
      throw error
    }
  }

  // Quality Records CRUD operations
  const addQualityRecord = async (qualityData) => {
    const { data, error } = await supabase
      .from('quality_records')
      .insert({ ...qualityData, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setQualityRecords([data, ...qualityRecords])
  }

  const updateQualityRecord = async (id, updates) => {
    const { error } = await supabase
      .from('quality_records')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setQualityRecords(qualityRecords.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const deleteQualityRecord = async (id) => {
    const { error } = await supabase
      .from('quality_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw error
    setQualityRecords(qualityRecords.filter(q => q.id !== id))
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const value = {
    mills,
    products,
    customers,
    purchaseOrders,
    qualityRecords,
    companyDetails,
    loading,
    addMill,
    updateMill,
    deleteMill,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addPurchaseOrder,
    updatePO,
    deletePO,
    addQualityRecord,
    updateQualityRecord,
    deleteQualityRecord,
    updateCompanyDetails,
    refreshData: fetchData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
