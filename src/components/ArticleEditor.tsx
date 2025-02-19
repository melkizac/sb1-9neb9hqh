import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { FontSize } from '../extensions/FontSize';
import Highlight from '@tiptap/extension-highlight';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import { ImageUpload } from './ImageUpload';
import { TableDialog } from './TableDialog';
import type { Article } from '../types/database';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Save,
  Table as TableIcon,
  Youtube as YoutubeIcon,
  Highlighter,
  Type as FontIcon,
  TextSelect,
  X,
} from 'lucide-react';

const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
];

const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'Huge', value: '24px' },
];

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
];

const HIGHLIGHT_COLORS = [
  '#FFEB3B', // Yellow
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#F44336', // Red
  '#9C27B0', // Purple
];

interface ArticleEditorProps {
  onSave: (data: {
    title: string;
    description: string;
    content: string;
    featuredImage: string;
  }) => void;
  article?: Article | null;
  onCancel: () => void;
}

export function ArticleEditor({ onSave, article, onCancel }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [description, setDescription] = useState(article?.description || '');
  const [featuredImage, setFeaturedImage] = useState(article?.featured_image || '');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [showTableDialog, setShowTableDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg'
        },
      }),
    ],
    content: article?.content || '',
  });

  const handleSave = () => {
    if (!editor) return;
    
    onSave({
      title,
      description,
      content: editor.getHTML(),
      featuredImage,
    });
  };

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  const insertYoutubeVideo = () => {
    if (!editor || !youtubeUrl) return;
    
    editor.commands.setYoutubeVideo({
      src: youtubeUrl,
      width: 640,
      height: 480,
    });
    
    setYoutubeUrl('');
    setShowYoutubeDialog(false);
  };

  const insertTable = (rows: number, cols: number, withHeader: boolean, borderStyle: string) => {
    if (!editor) return;

    const borderWidths = {
      thin: '1px',
      medium: '2px',
      thick: '3px'
    }[borderStyle];

    // Create table with proper attributes
    editor.chain().focus().insertTable({
      rows,
      cols,
      withHeaderRow: withHeader,
      HTMLAttributes: {
        class: 'border-collapse',
        style: `border: ${borderWidths} solid #e5e7eb;`
      }
    }).run();

    // Apply styles to cells
    const style = `border: ${borderWidths} solid #e5e7eb; padding: 8px;`;
    
    // Update all cells with proper styling
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
        editor.chain().setNodeSelection(pos).updateAttributes(node.type.name, {
          style
        }).run();
      }
    });

    // Ensure cursor is inside the first cell
    editor.chain().focus().run();
  };

  const handleFeaturedImageUpload = (imageUrl: string) => {
    setFeaturedImage(imageUrl);
    setShowImageUpload(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {article ? 'Edit Article' : 'Create New Article'}
        </h2>
        <button
          onClick={onCancel}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>

      {/* Featured Image */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Featured Image</h2>
          <button
            onClick={() => setShowImageUpload(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {featuredImage ? 'Change Image' : 'Add Image'}
          </button>
        </div>
        
        {showImageUpload ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <ImageUpload onUploadComplete={handleFeaturedImageUpload} />
          </div>
        ) : featuredImage && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={featuredImage}
              alt="Featured"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-nexius-teal focus:border-nexius-teal sm:text-sm"
          placeholder="Enter article title"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Short Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-nexius-teal focus:border-nexius-teal sm:text-sm"
          placeholder="Enter a brief description"
        />
      </div>

      {/* Editor */}
      {editor && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-1">
            {/* Text Style */}
            <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
              <select
                onChange={(e) => editor?.chain().focus().setFontFamily(e.target.value).run()}
                className="p-2 rounded hover:bg-gray-100 border border-gray-300"
              >
                <option value="">Font Family</option>
                {FONT_FAMILIES.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
              <select
                onChange={(e) => editor?.chain().focus().setFontSize(e.target.value).run()}
                className="ml-2 p-2 rounded hover:bg-gray-100 border border-gray-300"
                value={editor.getAttributes('textStyle').fontSize || ''}
              >
                <option value="">Font Size</option>
                {FONT_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Text Color */}
            <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
              <div className="relative group">
                <button className="p-2 rounded hover:bg-gray-100">
                  <FontIcon className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg p-2 hidden group-hover:block shadow-lg">
                  <div className="grid grid-cols-7 gap-1">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => editor?.chain().focus().setColor(color).run()}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative group ml-2">
                <button className="p-2 rounded hover:bg-gray-100">
                  <Highlighter className="h-4 w-4" />
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg p-2 hidden group-hover:block shadow-lg">
                  <div className="grid grid-cols-5 gap-1">
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => editor?.chain().focus().toggleHighlight({ color }).run()}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Formatting */}
            <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('bold') ? 'bg-gray-100' : ''
                }`}
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('italic') ? 'bg-gray-100' : ''
                }`}
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('underline') ? 'bg-gray-100' : ''
                }`}
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''
                }`}
              >
                <AlignLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''
                }`}
              >
                <AlignCenter className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''
                }`}
              >
                <AlignRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-100' : ''
                }`}
              >
                <AlignJustify className="h-4 w-4" />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('paragraph') ? 'bg-gray-100' : ''
                }`}
              >
                <Type className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''
                }`}
              >
                <Heading1 className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''
                }`}
              >
                <Heading2 className="h-4 w-4" />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('bulletList') ? 'bg-gray-100' : ''
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('orderedList') ? 'bg-gray-100' : ''
                }`}
              >
                <ListOrdered className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('blockquote') ? 'bg-gray-100' : ''
                }`}
              >
                <Quote className="h-4 w-4" />
              </button>
            </div>

            {/* Links and Images */}
            <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
              <button
                onClick={setLink}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('link') ? 'bg-gray-100' : ''
                }`}
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Tables and Media */}
            <div className="flex items-center border-r border-gray-200 pr-2 mr-2">
              <button
                onClick={() => setShowTableDialog(true)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowYoutubeDialog(true)}
                className="p-2 rounded hover:bg-gray-100"
              >
                <YoutubeIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center">
              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white p-4">
            <EditorContent editor={editor} className="prose max-w-none" />
          </div>
        </div>
      )}
      
      {/* YouTube Dialog */}
      {showYoutubeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Insert YouTube Video</h3>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Enter YouTube URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowYoutubeDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={insertYoutubeVideo}
                className="px-4 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Table Dialog */}
      {showTableDialog && (
        <TableDialog
          onClose={() => setShowTableDialog(false)}
          onInsert={insertTable}
        />
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
        >
          <Save className="h-4 w-4 mr-2" />
          {article ? 'Update Article' : 'Save Article'}
        </button>
      </div>
    </div>
  );}