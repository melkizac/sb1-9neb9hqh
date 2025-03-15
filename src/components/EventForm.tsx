import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Globe, Users, Ticket, Shield, X, Image, Eye, EyeOff } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Image as ImageExtension } from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { supabase } from '../lib/supabase';
import { ImageUpload } from './ImageUpload';
import type { Event } from '../types/database';

interface EventFormProps {
  onClose: () => void;
  onSave: () => void;
  event?: Event | null;
}

export function EventForm({ onClose, onSave, event }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '');
  const [startDate, setStartDate] = useState(event ? new Date(event.start_date).toISOString().split('T')[0] : '');
  const [startTime, setStartTime] = useState(event ? new Date(event.start_date).toTimeString().slice(0,5) : '');
  const [endDate, setEndDate] = useState(event ? new Date(event.end_date).toISOString().split('T')[0] : '');
  const [endTime, setEndTime] = useState(event ? new Date(event.end_date).toTimeString().slice(0,5) : '');
  const [location, setLocation] = useState(event?.location || '');
  const descriptionEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ImageExtension,
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
      FontFamily,
    ],
    content: event?.description || '',
    onUpdate: ({ editor }) => {
      // Store HTML content when editor updates
      const html = editor.getHTML();
      setDescription(html);
    },
  });
  const [description, setDescription] = useState(event?.description || '');
  const [content, setContent] = useState(event?.content || '');
  const [eventType, setEventType] = useState(event?.event_type || 'webinar');
  const [featuredImage, setFeaturedImage] = useState<string>(event?.featured_image || '');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [capacity, setCapacity] = useState<number | null>(event?.capacity || null);
  const [status, setStatus] = useState(event?.status || 'draft');
  const [loading, setLoading] = useState(false);
  const [ticketPrice, setTicketPrice] = useState<number | null>(event?.ticket_price || null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ImageExtension,
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
      FontFamily,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const handleImageUpload = (imageUrl: string) => {
    setFeaturedImage(imageUrl);
    setShowImageUpload(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      const eventData = {
        title,
        description,
        event_type: eventType,
        content,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        location,
        featured_image: featuredImage,
        status,
        capacity: capacity,
        ticket_price: ticketPrice,
        published_at: status === 'published' ? new Date().toISOString() : null,
        organizer_id: user.id,
      };

      const { error } = event
        ? await supabase
            .from('events')
            .update(eventData)
            .eq('id', event.id)
        : await supabase
            .from('events')
            .insert(eventData);

      if (error) throw error;
      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-nexius-navy">
          {event ? 'Edit Event' : 'Create Event'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Event Name
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
            placeholder="Enter event name"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
              placeholder="Add event location or virtual link"
            />
          </div>
        </div>

        {/* Event Type */}
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
          >
            <option value="webinar">Webinar</option>
            <option value="workshop">Workshop</option>
            <option value="conference">Conference</option>
            <option value="meetup">Meetup</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Featured Image */}
        <div>
          <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
            Featured Image
          </label>
          {showImageUpload ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <ImageUpload onUploadComplete={handleImageUpload} />
            </div>
          ) : featuredImage ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img
                src={featuredImage}
                alt="Featured"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setShowImageUpload(true)}
                className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div
              onClick={() => setShowImageUpload(true)}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-nexius-teal hover:text-nexius-teal transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <Image className="h-8 w-8 text-gray-400" />
              <span>Upload Featured Image</span>
              <span className="text-sm text-gray-500">Click to browse</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Rich Text)
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => descriptionEditor?.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  descriptionEditor?.isActive('bold') ? 'bg-gray-100' : ''
                }`}
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => descriptionEditor?.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  descriptionEditor?.isActive('italic') ? 'bg-gray-100' : ''
                }`}
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => descriptionEditor?.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  descriptionEditor?.isActive('underline') ? 'bg-gray-100' : ''
                }`}
              >
                Underline
              </button>
              <button
                type="button"
                onClick={() => descriptionEditor?.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  descriptionEditor?.isActive('bulletList') ? 'bg-gray-100' : ''
                }`}
              >
                Bullet List
              </button>
            </div>
            <EditorContent 
              editor={descriptionEditor} 
              className="prose max-w-none p-4 min-h-[120px] focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content (Rich Text)
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor?.isActive('bold') ? 'bg-gray-100' : ''
                }`}
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor?.isActive('italic') ? 'bg-gray-100' : ''
                }`}
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor?.isActive('underline') ? 'bg-gray-100' : ''
                }`}
              >
                Underline
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor?.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''
                }`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor?.isActive('bulletList') ? 'bg-gray-100' : ''
                }`}
              >
                Bullet List
              </button>
            </div>
            <EditorContent 
              editor={editor} 
              className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
            />
          </div>
        </div>

        {/* Event Options */}
        <div className="space-y-4 border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900">Event Options</h3>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              {status === 'published' ? (
                <Eye className="h-5 w-5 text-gray-400 mr-2" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-400 mr-2" />
              )}
              <span className="text-gray-700">Status</span>
            </div>
            <button
              type="button"
              onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                status === 'published'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {status === 'published' ? 'Published' : 'Draft'}
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">Require Approval</span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                name="toggle"
                id="toggle"
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="toggle"
                className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">Event Capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={capacity === null ? '' : capacity}
                onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Unlimited"
                className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal text-right"
              />
              <span className="text-gray-500 text-sm">seats</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <Ticket className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-700">Ticket Price</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={ticketPrice === null ? '' : ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Free"
                className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal text-right"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (event ? 'Updating...' : 'Creating...') : (event ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>
    </div>
  );
}