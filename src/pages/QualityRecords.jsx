import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useData } from '../contexts/DataContext'
import { downloadQualityPDF, shareQualityPDF } from '../services/pdfService'
import Card from '../components/Card'
import { FlowButton } from '../components/ui/FlowButton'
import Input from '../components/Input'
import EmptyState from '../components/EmptyState'
import Loading from '../components/Loading'
import Modal from '../components/Modal'
import { Archive, Search, Download, Share2, Eye, Edit2, Trash2 } from 'lucide-react'
import EditQualityModal from '../components/EditQualityModal'

export default function QualityRecords() {
  const { qualityRecords, companyDetails, loading, updateQualityRecord, deleteQualityRecord } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return qualityRecords

    const term = searchTerm.toLowerCase()
    return qualityRecords.filter(record =>
      record.sr_no.toLowerCase().includes(term) ||
      record.quality.toLowerCase().includes(term) ||
      record.width.toLowerCase().includes(term)
    )
  }, [qualityRecords, searchTerm])

  const viewRecord = (record) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  const editRecord = (record) => {
    setSelectedRecord(record)
    setIsEditOpen(true)
  }

  const handleDownload = async (record) => {
    try {
      await downloadQualityPDF(record, companyDetails)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF')
    }
  }

  const handleShare = async (record) => {
    try {
      await shareQualityPDF(record, companyDetails)
      toast.success('PDF shared successfully')
    } catch (error) {
      console.error('Error sharing PDF:', error)
      toast.error('Failed to share PDF')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteQualityRecord(id)
      setDeleteConfirm(null)
      toast.success('Quality record deleted successfully')
    } catch (error) {
      console.error('Error deleting record:', error)
      toast.error('Failed to delete quality record')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="container-mobile py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Quality Records</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by SR#, quality, width..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 sm:pl-10"
          />
        </div>
      </div>

      {filteredRecords.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="h-full flex flex-col">
              <div className="space-y-1.5 sm:space-y-2 flex-1">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base text-primary-600 dark:text-primary-400">SR #{record.sr_no}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 sm:mt-1 truncate">{record.quality}</div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{record.width}</div>
                  </div>
                </div>
                
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <div>Reed: {record.reed_on_loom}</div>
                  <div>Peek: {record.peek_on_loom}</div>
                  <div>Weight: {record.weight}</div>
                  <div className="font-medium">Rate: ₹{record.rate}</div>
                </div>

                <div className="flex gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 flex-wrap">
                  <FlowButton
                    onClick={() => viewRecord(record)}
                    text="View"
                    color="info"
                  />
                  <FlowButton
                    onClick={() => handleShare(record)}
                    text="Share"
                    color="info"
                  />
                  <FlowButton
                    onClick={() => handleDownload(record)}
                    text="PDF"
                    color="info"
                  />
                  <FlowButton
                    onClick={() => setDeleteConfirm(record.id)}
                    text="Delete"
                    color="danger"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Archive}
          title={searchTerm ? "No records found" : "No quality records yet"}
          description={searchTerm ? "Try a different search term" : "Create your first quality record to see it here"}
        />
      )}

      {selectedRecord && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Quality Record SR #${selectedRecord.sr_no}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div className="flex justify-between">
              <span className="font-medium">SR No:</span>
              <span>{selectedRecord.sr_no}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Width:</span>
              <span>{selectedRecord.width}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Quality:</span>
              <span className="text-right ml-2 truncate">{selectedRecord.quality}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reed on Loom:</span>
              <span>{selectedRecord.reed_on_loom}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Peek on Loom:</span>
              <span>{selectedRecord.peek_on_loom}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Weight:</span>
              <span>{selectedRecord.weight}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Rate:</span>
              <span>₹{selectedRecord.rate}</span>
            </div>
            {selectedRecord.remark && (
              <div className="pt-2 sm:pt-3 border-t dark:border-gray-700">
                <span className="font-medium">Remark:</span>
                <p className="mt-1 sm:mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-xs sm:text-sm">
                  {selectedRecord.remark}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6">
            <FlowButton
              fullWidth
              onClick={() => {
                setIsModalOpen(false)
                editRecord(selectedRecord)
              }}
              text="Edit"
              color="warning"
            />
            <FlowButton
              fullWidth
              onClick={() => {
                setIsModalOpen(false)
                setDeleteConfirm(selectedRecord.id)
              }}
              text="Delete"
              color="danger"
            />
          </div>
        </Modal>
      )}

      {selectedRecord && isEditOpen && (
        <EditQualityModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          record={selectedRecord}
          onSave={() => setIsEditOpen(false)}
        />
      )}

      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Quality Record"
          maxWidth="max-w-xs"
        >
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              Are you sure you want to delete SR #{qualityRecords.find(q => q.id === deleteConfirm)?.sr_no}?
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <FlowButton
                fullWidth
                onClick={() => setDeleteConfirm(null)}
                text="Cancel"
                color="neutral"
              />
              <FlowButton
                fullWidth
                onClick={() => handleDelete(deleteConfirm)}
                text="Delete"
                color="danger"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
