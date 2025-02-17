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
import { ImageUpload } from './ImageUpload';
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
  X,
} from 'lucide-react';

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
  );
}