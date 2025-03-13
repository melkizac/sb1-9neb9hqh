import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

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

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-1">
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
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-100' : ''
            }`}
          >
            <Heading3 className="h-4 w-4" />
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

        {/* Links */}
        <div className="flex items-center">
          <button
            onClick={setLink}
            className={`p-2 rounded hover:bg-gray-100 ${
              editor.isActive('link') ? 'bg-gray-100' : ''
            }`}
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white p-4">
        <EditorContent editor={editor} className="prose max-w-none min-h-[200px]" />
      </div>
    </div>
  );
}