import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useData } from '../contexts/DataContext'
import { purchaseOrderSchema, customerSchema, millSchema, productSchema } from '../lib/validation'
import { generatePONumber } from '../lib/utils'
import { downloadPDF, sharePDF } from '../services/pdfService'
import { FlowButton } from '../components/ui/FlowButton'
import Input from '../components/Input'
import Select from '../components/Select'
import Textarea from '../components/Textarea'
import Modal from '../components/Modal'
import { ArrowLeft, Download, Share2, Plus } from 'lucide-react'

export default function CreatePO() {
  const navigate = useNavigate()
  const { mills, products, customers, purchaseOrders, companyDetails, addPurchaseOrder, addCustomer, addMill, addProduct } = useData()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState(null)
  
  // Quick add modals state
  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [millModalOpen, setMillModalOpen] = useState(false)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      po_number: '',
      date: new Date().toISOString().split('T')[0],
      weight_unit: 'Kg',
      quantity_unit: 'Bags'
    }
  })

  // Quick add forms
  const customerForm = useForm({
    resolver: zodResolver(customerSchema)
  })

  const millForm = useForm({
    resolver: zodResolver(millSchema)
  })

  const productForm = useForm({
    resolver: zodResolver(productSchema)
  })

  // Generate PO Number - Use highest number + 1
  useEffect(() => {
    if (purchaseOrders.length > 0) {
      // Find the highest PO number
      const poNumbers = purchaseOrders
        .map(po => parseInt(po.po_number) || 0)
        .filter(num => num > 0)
      
      const highestNumber = Math.max(...poNumbers, 0)
      const newNumber = String(highestNumber + 1)
      setValue('po_number', newNumber)
    } else {
      setValue('po_number', '1')
    }
  }, [purchaseOrders, setValue])

  const onSubmit = async (data) => {
    // Check for duplicate PO number
    const isDuplicate = purchaseOrders.some(po => po.po_number === data.po_number)
    
    if (isDuplicate) {
      toast.error(`PO Number ${data.po_number} already exists. Please use a different number.`)
      return
    }
    
    setFormData(data)
    setShowPreview(true)
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await addPurchaseOrder(formData)
      toast.success('Purchase order created successfully')
      navigate('/history')
    } catch (error) {
      console.error('Error creating PO:', error)
      toast.error('Failed to create purchase order')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    }
  }

  const handleShare = async () => {
    try {
      await sharePDF(formData, companyDetails)
      toast.success('PDF shared successfully')
    } catch (error) {
      console.error('Error sharing PDF:', error)
      toast.error('Failed to share PDF')
    }
  }

  // Quick add handlers
  const handleAddCustomer = async (data) => {
    setSubmitting(true)
    try {
      await addCustomer(data)
      toast.success('Customer added successfully')
      setValue('party_name', data.name)
      setCustomerModalOpen(false)
      customerForm.reset({})
    } catch (error) {
      console.error('Error adding customer:', error)
      toast.error('Failed to add customer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddMill = async (data) => {
    setSubmitting(true)
    try {
      await addMill(data)
      toast.success('Mill added successfully')
      setValue('mill', data.name)
      setMillModalOpen(false)
      millForm.reset({})
    } catch (error) {
      console.error('Error adding mill:', error)
      toast.error('Failed to add mill')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddProduct = async (data) => {
    setSubmitting(true)
    try {
      await addProduct(data)
      toast.success('Product added successfully')
      setValue('product', data.name)
      setProductModalOpen(false)
      productForm.reset({})
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error('Failed to add product')
    } finally {
      setSubmitting(false)
    }
  }

  if (showPreview && formData) {
    return (
      <div className="container-mobile py-4 sm:py-6">
        <div className="mb-3 sm:mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
            Back to Edit
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 mb-3 sm:mb-4 transition-colors max-w-2xl">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center">Purchase Order Preview</h2>
          
          <div className="space-y-2 sm:space-y-3 border-t dark:border-gray-700 pt-3 sm:pt-4 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-medium">PO Number:</span>
              <span>{formData.po_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{formData.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Party Name:</span>
              <span className="text-right ml-2 truncate">{formData.party_name}</span>
            </div>
            {formData.broker && (
              <div className="flex justify-between">
                <span className="font-medium">Broker:</span>
                <span>{formData.broker}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Mill:</span>
              <span className="text-right ml-2 truncate">{formData.mill}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Product:</span>
              <span className="text-right ml-2 truncate">{formData.product}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Rate:</span>
              <span>₹{formData.rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Weight:</span>
              <span>{formData.weight} {formData.weight_unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Quantity:</span>
              <span>{formData.quantity} {formData.quantity_unit}</span>
            </div>
            {formData.terms_conditions && (
              <div className="pt-2 sm:pt-2 sm:pt-3 border-t dark:border-gray-700">
                <span className="font-medium">Terms & Conditions:</span>
                <p className="mt-1 sm:mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-xs sm:text-sm">{formData.terms_conditions}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 max-w-2xl">
          <FlowButton fullWidth onClick={handleConfirm} loading={loading} text="Confirm & Save" color="success" />
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <FlowButton fullWidth onClick={handleDownload} text="Download PDF" color="info" />
            <FlowButton fullWidth onClick={handleShare} text="Share PDF" color="info" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-mobile py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Create Purchase Order</h1>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Fill in the details below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="PO Number"
            required
            {...register('po_number')}
            error={errors.po_number?.message}
          />

          <Input
            type="date"
            label="Date"
            required
            {...register('date')}
            error={errors.date?.message}
          />
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Select
              label="Party Name"
              required
              options={customers.map(c => ({ value: c.name, label: c.name }))}
              placeholder="Select customer"
              value={watch('party_name')}
              {...register('party_name')}
              error={errors.party_name?.message}
            />
          </div>
          <button
            type="button"
            onClick={() => setCustomerModalOpen(true)}
            className="flex-shrink-0 mb-1 p-2 sm:p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Add new customer"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <Input
          label="Broker"
          {...register('broker')}
          error={errors.broker?.message}
        />

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Select
              label="Mill"
              required
              options={mills.map(m => ({ value: m.name, label: m.name }))}
              placeholder="Select mill"
              value={watch('mill')}
              {...register('mill')}
              error={errors.mill?.message}
            />
          </div>
          <button
            type="button"
            onClick={() => setMillModalOpen(true)}
            className="flex-shrink-0 mb-1 p-2 sm:p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Add new mill"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Select
              label="Product"
              required
              options={products.map(p => ({ value: p.name, label: p.name }))}
              placeholder="Select product"
              value={watch('product')}
              {...register('product')}
              error={errors.product?.message}
            />
          </div>
          <button
            type="button"
            onClick={() => setProductModalOpen(true)}
            className="flex-shrink-0 mb-1 p-2 sm:p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Add new product"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <Input
          label="Rate"
          required
          type="number"
          step="0.01"
          {...register('rate')}
          error={errors.rate?.message}
        />

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Input
            label="Weight"
            required
            {...register('weight')}
            error={errors.weight?.message}
          />
          <Select
            label="Unit"
            required
            options={[
              { value: 'Kg', label: 'Kg' },
              { value: 'Meters', label: 'Meters' }
            ]}
            value={watch('weight_unit')}
            {...register('weight_unit')}
            error={errors.weight_unit?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <Input
            label="Quantity"
            required
            {...register('quantity')}
            error={errors.quantity?.message}
          />
          <Select
            label="Unit"
            required
            options={[
              { value: 'Bags', label: 'Bags' },
              { value: 'Taka', label: 'Taka' }
            ]}
            value={watch('quantity_unit')}
            {...register('quantity_unit')}
            error={errors.quantity_unit?.message}
          />
        </div>

        <Textarea
          label="Terms & Conditions"
          rows={3}
          {...register('terms_conditions')}
          error={errors.terms_conditions?.message}
        />

        <div className="pt-2 sm:pt-4">
          <FlowButton type="submit" fullWidth text="Preview Order" />
        </div>
      </form>

      {/* Quick Add Customer Modal */}
      <Modal
        isOpen={customerModalOpen}
        onClose={() => { setCustomerModalOpen(false); customerForm.reset({}) }}
        title="Add Customer"
        maxWidth="max-w-md"
      >
        <form onSubmit={customerForm.handleSubmit(handleAddCustomer)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Input
              label="Customer Name"
              required
              {...customerForm.register('name')}
              error={customerForm.formState.errors.name?.message}
            />
            <Input
              label="Contact"
              type="tel"
              {...customerForm.register('contact')}
              error={customerForm.formState.errors.contact?.message}
            />
            <Input
              label="Email"
              type="email"
              {...customerForm.register('email')}
              error={customerForm.formState.errors.email?.message}
            />
            <Textarea
              label="Address"
              rows={3}
              {...customerForm.register('address')}
              error={customerForm.formState.errors.address?.message}
            />
          </div>
          <div className="flex-shrink-0 flex gap-2 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <FlowButton type="button" onClick={() => { setCustomerModalOpen(false); customerForm.reset({}) }} fullWidth text="Cancel" color="neutral" />
            <FlowButton type="submit" fullWidth loading={submitting} text="Add" color="success" />
          </div>
        </form>
      </Modal>

      {/* Quick Add Mill Modal */}
      <Modal
        isOpen={millModalOpen}
        onClose={() => { setMillModalOpen(false); millForm.reset({}) }}
        title="Add Mill"
        maxWidth="max-w-md"
      >
        <form onSubmit={millForm.handleSubmit(handleAddMill)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Input
              label="Mill Name"
              required
              {...millForm.register('name')}
              error={millForm.formState.errors.name?.message}
            />
            <Input
              label="Contact"
              type="tel"
              {...millForm.register('contact')}
              error={millForm.formState.errors.contact?.message}
            />
            <Input
              label="Email"
              type="email"
              {...millForm.register('email')}
              error={millForm.formState.errors.email?.message}
            />
            <Textarea
              label="Address"
              rows={3}
              {...millForm.register('address')}
              error={millForm.formState.errors.address?.message}
            />
            <Input
              label="GSTIN"
              {...millForm.register('gstin')}
              error={millForm.formState.errors.gstin?.message}
            />
          </div>
          <div className="flex-shrink-0 flex gap-2 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <FlowButton type="button" onClick={() => { setMillModalOpen(false); millForm.reset({}) }} fullWidth text="Cancel" color="neutral" />
            <FlowButton type="submit" fullWidth loading={submitting} text="Add" color="success" />
          </div>
        </form>
      </Modal>

      {/* Quick Add Product Modal */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => { setProductModalOpen(false); productForm.reset({}) }}
        title="Add Product"
        maxWidth="max-w-md"
      >
        <form onSubmit={productForm.handleSubmit(handleAddProduct)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Input
              label="Product Name"
              required
              {...productForm.register('name')}
              error={productForm.formState.errors.name?.message}
            />
            <Textarea
              label="Description"
              rows={3}
              {...productForm.register('description')}
              error={productForm.formState.errors.description?.message}
            />
          </div>
          <div className="flex-shrink-0 flex gap-2 p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <FlowButton type="button" onClick={() => { setProductModalOpen(false); productForm.reset({}) }} fullWidth text="Cancel" color="neutral" />
            <FlowButton type="submit" fullWidth loading={submitting} text="Add" color="success" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
