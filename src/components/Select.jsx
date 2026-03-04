import { forwardRef, useState, useEffect, useRef } from 'react'
import { ChevronDown, X } from 'lucide-react'

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select...',
  required = false,
  className = '',
  value,
  onChange,
  disabled = false,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Find the selected option label
  useEffect(() => {
    const selected = options.find(opt => opt.value === value)
    setSelectedLabel(selected ? selected.label : '')
  }, [value, options])

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const handleSelect = (option) => {
    if (onChange) {
      // Create a synthetic event that mimics a native select change event
      const syntheticEvent = {
        target: {
          value: option.value,
          name: props.name
        }
      }
      onChange(syntheticEvent)
    }
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    if (onChange) {
      const syntheticEvent = {
        target: {
          value: '',
          name: props.name
        }
      }
      onChange(syntheticEvent)
    }
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        // Focus input when opening dropdown
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
  }

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Hidden input for form compatibility */}
        <input
          type="hidden"
          ref={ref}
          value={value || ''}
          name={props.name}
        />
        
        {/* Display/Search Input */}
        <div
          className={`input cursor-pointer flex items-center justify-between ${
            error ? 'border-red-500 focus:ring-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
          onClick={handleToggle}
        >
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="flex-1 outline-none bg-transparent text-base"
              onClick={(e) => e.stopPropagation()}
              disabled={disabled}
            />
          ) : (
            <span className={`flex-1 ${!selectedLabel ? 'text-gray-400' : ''}`}>
              {selectedLabel || placeholder}
            </span>
          )}
          
          <div className="flex items-center gap-1">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Options Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm sm:text-base ${
                    value === option.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : ''
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
