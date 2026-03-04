import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useData } from '../contexts/DataContext'
import { qualityRecordSchema } from '../lib/validation'
import { downloadQualityPDF, shareQualityPDF } from '../services/pdfService'
import { FlowButton } from '../components/ui/FlowButton'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import { ArrowLeft, Download, Share2 } from 'lucide-react'

export default function CreateQuality() {
  const navigate = useNavigate()
  const { qualityRecords, companyDetails, addQualityRecord } = useData()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(qualityRecordSchema),
    defaultValues: {
      sr_no: '',
      width: '',
      quality: '',
      reed_on_loom: '',
      peek_on_loom: '',
      weight: '',
      rate: '',
      remark: ''
    }
  })

  // Auto-generate SR No
  useEffect(() => {
    if (qualityRecords.length > 0) {
      const srNumbers = qualityRecords
        .map(q => parseInt(q.sr_no) || 0)
        .filter(num => num > 0)
      
      const highestNumber = Math.max(...srNumbers, 0)
      const newNumber = String(highestNumber + 1)
      setValue('sr_no', newNumber)
    } else {
      setValue('sr_no', '1')
    }
  }, [qualityRecords, setValue])

  const onSubmit = async (data) => {
    // Check for duplicate SR No
    const isDuplicate = qualityRecords.some(q => q.sr_no === data.sr_no)
    
    if (isDuplicate) {
      toast.error(`SR No ${data.sr_no} already exists. Please use a different number.`)
      return
    }
    
    setLoading(true)
    try {
      await addQualityRecord(data)
      toast.success('Quality record saved successfully')
      navigate('/quality-records')
    } catch (error) {
      console.error('Error creating quality record:', error)
      toast.error('Failed to save quality record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-mobile py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Create Quality Record</h1>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1">Fill in the quality details below</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="SR No"
            type="number"
            required
            {...register('sr_no')}
            error={errors.sr_no?.message}
          />

          <Input
            label="Width"
            required
            {...register('width')}
            error={errors.width?.message}
            placeholder="e.g., 60 inches"
          />
        </div>

        <Input
          label="Quality"
          required
          {...register('quality')}
          error={errors.quality?.message}
          placeholder="e.g., Premium, Standard"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Reed on Loom"
            required
            {...register('reed_on_loom')}
            error={errors.reed_on_loom?.message}
            placeholder="e.g., 1000"
          />

          <Input
            label="Peek on Loom"
            required
            {...register('peek_on_loom')}
            error={errors.peek_on_loom?.message}
            placeholder="e.g., 500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Input
            label="Weight"
            required
            {...register('weight')}
            error={errors.weight?.message}
            placeholder="e.g., 250 Kg"
          />

          <Input
            label="Rate"
            type="number"
            step="0.01"
            required
            {...register('rate')}
            error={errors.rate?.message}
            placeholder="e.g., 150.50"
          />
        </div>

        <Textarea
          label="Remark"
          placeholder="Additional remarks or notes..."
          {...register('remark')}
          error={errors.remark?.message}
          rows={3}
        />

        <div className="pt-2 sm:pt-4">
          <FlowButton fullWidth type="submit" text="Save Quality Record" color="success" loading={loading} />
        </div>
      </form>
    </div>
  )
}
