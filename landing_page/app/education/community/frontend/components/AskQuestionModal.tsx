// Ask Question Modal Component
// Location: src/components/education/community/frontend/components/AskQuestionModal.tsx

'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, Badge } from '../../../shared/ui-components'
import { CreateQuestionData, Category } from '../../shared/types'
import { 
  X, 
  Upload, 
  AlertTriangle, 
  Hash, 
  Plus,
  Eye,
  FileImage,
  Trash2,
  MapPin,
  Camera,
  Loader2
} from 'lucide-react'

interface AskQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateQuestionData) => Promise<void>
  categories: Category[]
  userLocation?: string
  loading?: boolean
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  userLocation,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateQuestionData>({
    title: '',
    content: '',
    categoryId: '',
    tags: [],
    images: [],
    isUrgent: false,
    isAnonymous: false,
    location: userLocation || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentTag, setCurrentTag] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      categoryId: '',
      tags: [],
      images: [],
      isUrgent: false,
      isAnonymous: false,
      location: userLocation || ''
    })
    setErrors({})
    setCurrentTag('')
    setPreviewMode(false)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length < 20) {
      newErrors.content = 'Content must be at least 20 characters'
    } else if (formData.content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category'
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'Please add at least one tag'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await onSubmit(formData)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Failed to submit question:', error)
      // Handle error - could show a toast notification
    } finally {
      setSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate files
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isImage && isValidSize
    })

    if (validFiles.length !== files.length) {
      alert('Only image files under 5MB are allowed')
    }

    // Convert to base64 or handle upload
    Promise.all(validFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
    })).then(imageUrls => {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...imageUrls].slice(0, 5) // Max 5 images
      }))
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (!currentTag.trim()) return
    if (formData.tags.includes(currentTag.trim())) return
    if (formData.tags.length >= 5) return // Max 5 tags

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, currentTag.trim()]
    }))
    setCurrentTag('')
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Ask a Question</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-gray-500"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {previewMode ? (
                /* Preview Mode */
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">{formData.title || 'Question Title'}</h3>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{formData.content || 'Question content...'}</p>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {formData.tags.map(tag => (
                          <Badge key={tag} className="bg-green-100 text-green-700">
                            <Hash className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {(formData.images?.length || 0) > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                        {formData.images?.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What's your question? Be specific and clear..."
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength={200}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      {formData.title.length}/200 characters
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.categoryId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} - {category.description}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Details *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Describe your question in detail. Include any relevant context, what you've tried, and what kind of help you're looking for..."
                      rows={8}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.content ? 'border-red-500' : 'border-gray-300'
                      }`}
                      maxLength={5000}
                    />
                    {errors.content && (
                      <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      {formData.content.length}/5000 characters
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags * (Up to 5)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} className="bg-green-100 text-green-700 flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag (e.g., wheat, irrigation, pests)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        maxLength={20}
                        disabled={formData.tags.length >= 5}
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        disabled={!currentTag.trim() || formData.tags.length >= 5}
                        size="sm"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {errors.tags && (
                      <p className="text-red-500 text-sm mt-1">{errors.tags}</p>
                    )}
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images (Optional, up to 5)
                    </label>
                    
                    {(formData.images?.length || 0) > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {formData.images?.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={(formData.images?.length || 0) >= 5}
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {(formData.images?.length || 0) === 0 ? 'Add Images' : `Add More Images (${formData.images?.length || 0}/5)`}
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <p className="text-gray-500 text-sm mt-1">
                      Upload clear photos of your crops, soil, or farming conditions. Max 5MB per image.
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-800">Additional Options</h4>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="urgent"
                        checked={formData.isUrgent}
                        onChange={(e) => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="urgent" className="flex items-center gap-2 text-sm text-gray-700">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Mark as urgent (crops at risk, immediate help needed)
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor="anonymous" className="text-sm text-gray-700">
                        Post anonymously
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Your location (optional, helps with local advice)"
                        className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                Make sure your question is clear and provides enough context for helpful answers.
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={submitting || loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Question'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AskQuestionModal
