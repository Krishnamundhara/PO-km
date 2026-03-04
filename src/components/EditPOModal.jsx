import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useData } from '../contexts/DataContext'
import { purchaseOrderSchema } from '../lib/validation'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'
import Select from './Select'
import Textarea from './Textarea'

export default function EditPOModal({ isOpen, onClose, order, onSave }) {
  const { mills, products, customers, updatePO, purchaseOrders } = useData()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: order
  })

  const onSubmit = async (data) => {
    setSubmitting(true)
    setError('')
    try {
      // Check for duplicate PO numbers (excluding current order)
      const isDuplicate = purchaseOrders.some(po => 
        po.id !== order.id && po.po_number === data.po_number
      )
      
      if (isDuplicate) {
        setError(`PO Number ${data.po_number} already exists. Please use a different number.`)
        setSubmitting(false)
        return
      }

      await updatePO(order.id, data)
      onSave()
      onClose()
    } catch (err) {
      console.error('Error updating PO:', err)
      setError(err.message || 'Failed to update PO')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit PO #${order?.po_number}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 max-h-[65vh] overflow-y-auto overscroll-contain px-0.5">
        {error && (
          <div className="p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
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

        <Select
          label="Party Name"
          required
          options={customers.map(c => ({ value: c.name, label: c.name }))}
          placeholder="Select customer"
          value={watch('party_name')}
          {...register('party_name')}
          error={errors.party_name?.message}
        />

        <Input
          label="Broker"
          {...register('broker')}
          error={errors.broker?.message}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Mill"
            required
            options={mills.map(m => ({ value: m.name, label: m.name }))}
            placeholder="Select mill"
            value={watch('mill')}
            {...register('mill')}
            error={errors.mill?.message}
          />

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

        <Input
          label="Rate"
          required
          type="number"
          step="0.01"
          {...register('rate')}
          error={errors.rate?.message}
        />

        <div className="grid grid-cols-2 gap-3">
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

        <div className="grid grid-cols-2 gap-3">
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

        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-1">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={submitting}>
            Update
          </Button>
        </div>
      </form>
    </Modal>
  )
}
