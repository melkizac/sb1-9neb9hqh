import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth } from '../components/Auth';
import { EventForm } from '../components/EventForm';
import { EventsList } from '../components/EventsList';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ImageUpload } from '../components/ImageUpload';
import { ArticleEditor } from '../components/ArticleEditor';
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
  const [editingImage, setEditingImage] = useState<Image | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatSession, setActiveChatSession] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
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
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/'; // Redirect to home page after logout
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData();
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
        loadEvents(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
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
    setLoading(true);
    const leads = await getLeads();
    setLeads(leads);
  };

  const loadChatSessions = async () => {
    setLoadingChats(true);
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('last_message_at', { ascending: false });


      if (sessionsError) {
        console.error('Error loading chat sessions:', sessionsError);
        return;
      }

      setChatSessions(sessions || []);

      // If we have an active session, reload its messages
      if (activeChatSession) {
        await loadChatMessages(activeChatSession.id);
      }
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadsError) {
        console.error('Error loading leads:', leadsError);
        return;
      }

      console.log('Loaded leads:', leadsData);
      setLeads(leadsData || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
      setLoadingChats(false);
    }
  };

  const loadChatMessages = async (sessionId: string) => {
    if (!sessionId) return;

    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat messages:', error);
        return;
      }

      setChatMessages(messages || []);

      // Mark messages as read
      if (messages?.length) {
        await markMessagesAsRead(sessionId);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const handleSessionClick = (session: ChatSession) => {
    setActiveChatSession(session);
    loadChatMessages(session.id);
    
    // Subscribe to new messages for this session
    const channel = supabase
      .channel(`chat:${session.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${session.id}`,
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatSession) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: activeChatSession.id,
          visitor_id: activeChatSession.visitor_id,
          content: newMessage.trim(),
          is_from_visitor: false,
          user_id: user.id,
          read: true
        })
        .select()
        .single();

      if (error) throw error;

      // Update messages immediately
      setChatMessages(prev => [...prev, message]);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
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

  const handleEditImage = async (data: { title: string; description: string }) => {
    if (!editingImage) return;

    try {
      await updateImage(editingImage.id, {
        title: data.title,
        description: data.description,
        metadata: editingImage.metadata, // Preserve existing metadata
        storage_path: editingImage.storage_path, // Preserve storage path
        url: editingImage.url // Preserve URL
      });
      
      // Refresh the images list and reset editing state
      setEditingImage(null);
      await loadImages();
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error updating image. Please try again.');
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
            onClick={() => setIsCreatingEvent(true)}
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

    if (loading && activeSection === 'leads') {
      return (
        <div className="flex items-center justify-center h-64">
          <EventsList 
            events={events} 
            onEventClick={(event) => setEditingEvent(event)}
          />
        </div>
      );
    }

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
              <div className="space-y-6">
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
                
                {editingImage && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <ImageUpload
                      onUploadComplete={() => {}}
                      editMode={true}
                      initialData={{
                        title: editingImage.title,
                        description: editingImage.description || '',
                      }}
                      onSave={handleEditImage}
                      onCancel={() => setEditingImage(null)}
                    />
                  </div>
                )}

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
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingImage(image)}
                          className="p-2 bg-white rounded-full text-nexius-teal hover:text-nexius-teal/90 hover:bg-white/90 transition-colors"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteImage(image)}
                          className="p-2 bg-white rounded-full text-red-600 hover:text-red-700 hover:bg-white/90 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{image.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{image.description || 'No description'}</p>
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
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Articles</h2>
              <button
                onClick={handleCreateArticle}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Article
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-nexius-teal/30 hover:shadow-lg transition-all">
                  {article.featured_image && (
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : article.status === 'draft'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingArticle(article);
                            setIsCreatingArticle(true);
                          }}
                          className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this article?')) {
                              await deleteArticle(article.id);
                              loadArticles();
                            }
                          }}
                          className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                    {article.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      {article.status === 'draft' ? (
                        <button
                          onClick={async () => {
                            await publishArticle(article.id);
                            loadArticles();
                          }}
                          className="text-nexius-teal hover:text-nexius-teal/90 font-medium"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await unpublishArticle(article.id);
                            loadArticles();
                          }}
                          className="text-gray-500 hover:text-gray-700 font-medium"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'store':
        return renderEmptyState(section);

      case 'courses':
        return renderEmptyState(section);

      case 'case-studies':
        return renderEmptyState(section);

      case 'events':
        return isCreatingEvent ? (
          <EventForm
            event={editingEvent}
            onClose={() => setIsCreatingEvent(false)}
            onSave={() => {
              setIsCreatingEvent(false);
              setEditingEvent(null);
              loadEvents();
            }}
          />
        ) : editingEvent ? (
          <EventForm
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onSave={() => {
              setEditingEvent(null);
              loadEvents();
            }}
          />
        ) : events.length === 0 ? (
          renderEmptyState(section)
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Events</h2>
              <button
                onClick={() => setIsCreatingEvent(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Event
              </button>
            </div>
            <EventsList 
              events={events} 
              onEventClick={(event) => setEditingEvent(event)}
            />
          </div>
        );

      case 'leads':
        return leads.length === 0 ? (
          renderEmptyState(section)
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Leads</h2>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.first_name} {lead.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lead.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lead.status === 'new' 
                            ? 'bg-green-100 text-green-800'
                            : lead.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'chat':
        return chatSessions.length === 0 ? (
          renderEmptyState(section)
        ) : window.innerWidth <= 690 ? (
          <div className="grid grid-cols-1">
            {/* Chat Sessions List */}
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${activeChatSession ? 'hidden' : 'block'}`}>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Chat Sessions</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {chatSessions.map((session) => (
                  <button
                    key={`chat-session-${session.id}`}
                    onClick={() => handleSessionClick(session)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      activeChatSession?.id === session.id ? 'bg-nexius-teal/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {session.visitor_name || 'Anonymous Visitor'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(session.last_message_at).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${activeChatSession ? 'block' : 'hidden'}`}>
              {activeChatSession ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <button
                      onClick={() => setActiveChatSession(null)}
                      className="inline-flex items-center text-gray-500 hover:text-gray-700 mr-3"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span>Back</span>
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Chat with {activeChatSession.visitor_name || 'Anonymous Visitor'}
                    </h3>
                  </div>
                  <div className="flex flex-col h-[600px]">
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {chatMessages.map((message) => (
                        <div
                          key={`chat-message-${message.id}`}
                          className={`flex ${
                            message.is_from_visitor ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              message.is_from_visitor
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-nexius-teal text-white'
                            }`}
                          >
                            {message.content}
                            <div className="text-xs mt-1 opacity-70">
                              {new Date(message.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendAdminMessage} className="p-4 border-t">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Select a chat session to view messages
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Desktop Chat Sessions List */}
            <div className="col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Chat Sessions</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {chatSessions.map((session) => (
                  <button
                    key={`chat-session-${session.id}`}
                    onClick={() => handleSessionClick(session)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      activeChatSession?.id === session.id ? 'bg-nexius-teal/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {session.visitor_name || 'Anonymous Visitor'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(session.last_message_at).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Chat Messages */}
            <div className="col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {activeChatSession ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Chat with {activeChatSession.visitor_name || 'Anonymous Visitor'}
                    </h3>
                  </div>
                  <div className="flex flex-col h-[600px]">
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {chatMessages.map((message) => (
                        <div
                          key={`chat-message-${message.id}`}
                          className={`flex ${
                            message.is_from_visitor ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              message.is_from_visitor
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-nexius-teal text-white'
                            }`}
                          >
                            {message.content}
                            <div className="text-xs mt-1 opacity-70">
                              {new Date(message.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleSendAdminMessage} className="p-4 border-t">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Select a chat session to view messages
                </div>
              )}
            </div>
          </div>
        );

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
                onClick={handleLogout}
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
      <div className={`fixed inset-y-0 left-0 pt-16 block ${isNavCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="h-full flex flex-col">
          <nav className="flex-1 px-2 py-4 space-y-1 relative">
            <button
              onClick={() => setIsNavCollapsed(!isNavCollapsed)}
              className="absolute -right-3 top-2 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 transition-colors z-10"
            >
              {isNavCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-500" />
              )}
            </button>
            {SECTIONS.map((section) => {
              const Icon = section.Icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center ${isNavCollapsed ? 'px-3' : 'px-4'} py-3 text-sm font-medium rounded-lg ${
                    activeSection === section.id
                      ? 'bg-nexius-teal/10 text-nexius-teal'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } transition-colors`}
                  title={section.name}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className={`${isNavCollapsed ? 'hidden' : 'block'} transition-opacity`}>
                    {section.name}
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${isNavCollapsed ? 'px-3 justify-center' : 'px-4'} py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors`}
              title="Logout"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className={`${isNavCollapsed ? 'hidden' : 'block'} transition-opacity`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`${isNavCollapsed ? 'pl-16' : 'pl-64'} pt-16 transition-all duration-300`}>
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

export { AdminPage };