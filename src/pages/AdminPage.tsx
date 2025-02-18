import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth } from '../components/Auth';
import { ImageUpload } from '../components/ImageUpload';
import { ArticleEditor } from '../components/ArticleEditor';
import { getImages, deleteImageRecord } from '../lib/images';
import { deleteImage } from '../lib/storage';
import { createArticle, getArticles, updateArticle, deleteArticle, publishArticle, unpublishArticle } from '../lib/articles';
import { getLeads, updateLeadStatus, deleteLead } from '../lib/leads';
import { getChatSessions, getChatMessages, sendChatMessage, markMessagesAsRead, closeChatSession } from '../lib/chats';
import {
  Image as ImageIcon,
  FileText,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Plus,
  Trash2,
  ChevronDown,
  Search,
  Edit2,
  Eye,
  EyeOff,
  ShoppingCart,
  GraduationCap,
  UserCheck,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  X,
} from 'lucide-react';
import type { Image, Article, Lead, ChatSession, ChatMessage } from '../types/database';

const SECTIONS = [
  { id: 'images', name: 'Images', Icon: ImageIcon, description: 'Upload and manage your website images.' },
  { id: 'articles', name: 'Articles', Icon: FileText, description: 'Create and manage your blog articles.' },
  { id: 'store', name: 'Store', Icon: ShoppingCart, description: 'Manage your products, categories, and orders.' },
  { id: 'courses', name: 'Courses', Icon: GraduationCap, description: 'Create and manage your online courses.' },
  { id: 'case-studies', name: 'Case Studies', Icon: BookOpen, description: 'Share your success stories and client results.' },
  { id: 'events', name: 'Events', Icon: Calendar, description: 'Organize and manage your upcoming events.' },
  { id: 'leads', name: 'Leads', Icon: UserCheck, description: 'Manage and track your sales leads.' },
  { id: 'chat', name: 'Chat', Icon: MessageSquare, description: 'Manage live chat conversations with visitors.' },
];

const EmptyState = ({ section, actionButton }: { section: typeof SECTIONS[0], actionButton?: React.ReactNode }) => (
  <div className="text-center py-16">
    <div className="relative inline-block mb-6">
      <div className="absolute -inset-2 bg-nexius-teal/20 rounded-lg blur-lg opacity-50"></div>
      <section.Icon className="relative h-16 w-16 text-nexius-teal" />
    </div>
    <h3 className="text-2xl font-display font-bold text-nexius-navy mb-3">
      No {section.name} Yet
    </h3>
    <p className="text-nexius-charcoal max-w-md mx-auto mb-8">
      {section.description}
    </p>
    {actionButton}
  </div>
);

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [activeSection, setActiveSection] = useState('images');
  const [images, setImages] = useState<Image[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  // State for modals
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddCaseStudy, setShowAddCaseStudy] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadData();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadImages(),
        loadArticles(),
        loadLeads(),
        loadChatSessions(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    const images = await getImages();
    setImages(images);
  };

  const loadArticles = async () => {
    const articles = await getArticles();
    setArticles(articles);
  };

  const loadLeads = async () => {
    const leads = await getLeads();
    setLeads(leads);
  };

  const loadChatSessions = async () => {
    const sessions = await getChatSessions();
    setChatSessions(sessions);
  };

  const handleImageUpload = (imageUrl: string) => {
    loadImages();
    setShowImageUpload(false);
  };

  const handleDeleteImage = async (image: Image) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await deleteImage(image.storage_path);
      await deleteImageRecord(image.id);
      await loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };

  const handleCreateArticle = () => {
    setIsCreatingArticle(true);
    setEditingArticle(null);
  };

  const handleSaveArticle = async (articleData: {
    title: string;
    description: string;
    content: string;
    featuredImage: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (editingArticle) {
        await updateArticle(editingArticle.id, {
          ...articleData,
          featured_image: articleData.featuredImage,
        });
      } else {
        await createArticle({
          ...articleData,
          featured_image: articleData.featuredImage,
          status: 'draft',
          author_id: user.id,
        });
      }

      setIsCreatingArticle(false);
      setEditingArticle(null);
      loadArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error saving article. Please try again.');
    }
  };

  const renderEmptyState = (section: typeof SECTIONS[0]) => {
    let actionButton;

    switch (section.id) {
      case 'images':
        actionButton = (
          <button
            onClick={() => setShowImageUpload(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload Image
          </button>
        );
        break;

      case 'articles':
        actionButton = (
          <button
            onClick={handleCreateArticle}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Article
          </button>
        );
        break;

      case 'store':
        actionButton = (
          <button
            onClick={() => setShowAddProduct(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        );
        break;

      case 'courses':
        actionButton = (
          <button
            onClick={() => setShowAddCourse(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Course
          </button>
        );
        break;

      case 'case-studies':
        actionButton = (
          <button
            onClick={() => setShowAddCaseStudy(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Case Study
          </button>
        );
        break;

      case 'events':
        actionButton = (
          <button
            onClick={() => setShowAddEvent(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </button>
        );
        break;

      case 'leads':
        actionButton = (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Leads will appear here when visitors submit the contact form.
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
            >
              View Contact Form
            </a>
          </div>
        );
        break;

      case 'chat':
        actionButton = (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Chat sessions will appear here when visitors start conversations.
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
            >
              View Chat Widget
            </a>
          </div>
        );
        break;
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <EmptyState section={section} actionButton={actionButton} />
      </div>
    );
  };

  const renderContent = () => {
    const section = SECTIONS.find((s) => s.id === activeSection);
    if (!section) return null;

    switch (activeSection) {
      case 'images':
        return (
          <div>
            {showImageUpload ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upload Image</h2>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <ImageUpload onUploadComplete={handleImageUpload} />
              </div>
            ) : images.length === 0 ? (
              renderEmptyState(section)
            ) : (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Images</h2>
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Upload Image
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteImage(image)}
                          className="p-2 bg-white rounded-full text-red-600 hover:text-red-700 hover:bg-white/90 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{image.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{new Date(image.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'articles':
        return isCreatingArticle ? (
          <ArticleEditor
            onSave={handleSaveArticle}
            article={editingArticle}
            onCancel={() => {
              setIsCreatingArticle(false);
              setEditingArticle(null);
            }}
          />
        ) : articles.length === 0 ? (
          renderEmptyState(section)
        ) : null;

      case 'store':
        return renderEmptyState(section);

      case 'courses':
        return renderEmptyState(section);

      case 'case-studies':
        return renderEmptyState(section);

      case 'events':
        return renderEmptyState(section);

      case 'leads':
        return leads.length === 0 ? renderEmptyState(section) : null;

      case 'chat':
        return chatSessions.length === 0 ? renderEmptyState(section) : null;

      default:
        return null;
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img
                  src="https://tunidbyclygzipvbfzee.supabase.co/storage/v1/object/public/website-images/m04h4fs8wns-1739784195705.png"
                  alt="NEXIUS Labs"
                  className="h-8 w-8"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Admin Portal
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => supabase.auth.signOut()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 pt-16 block w-64 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.Icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    activeSection === section.id
                      ? 'bg-nexius-teal/10 text-nexius-teal'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {section.name}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg"
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pl-64 pt-16">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              {SECTIONS.find((s) => s.id === activeSection)?.name}
            </h1>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export { AdminPage }