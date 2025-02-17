import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Auth } from '../components/Auth';
import { ImageUpload } from '../components/ImageUpload';
import { ArticleEditor } from '../components/ArticleEditor';
import { getImages, deleteImageRecord } from '../lib/images';
import { deleteImage } from '../lib/storage';
import { createArticle, getArticles, updateArticle, deleteArticle, publishArticle, unpublishArticle } from '../lib/articles';
import { getLeads, updateLeadStatus, deleteLead } from '../lib/leads';
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
} from 'lucide-react';
import type { Image, Article, Lead } from '../types/database';

const SECTIONS = [
  { id: 'images', name: 'Images', Icon: ImageIcon, description: 'Upload and manage your website images.' },
  { id: 'articles', name: 'Articles', Icon: FileText, description: 'Create and manage your blog articles.' },
  { id: 'store', name: 'Store', Icon: ShoppingCart, description: 'Manage your products, categories, and orders.' },
  { id: 'courses', name: 'Courses', Icon: GraduationCap, description: 'Create and manage your online courses.' },
  { id: 'case-studies', name: 'Case Studies', Icon: BookOpen, description: 'Share your success stories and client results.' },
  { id: 'events', name: 'Events', Icon: Calendar, description: 'Organize and manage your upcoming events.' },
  { id: 'leads', name: 'Leads', Icon: UserCheck, description: 'Manage and track your sales leads.' },
];

const LEAD_STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  unqualified: 'bg-red-100 text-red-800',
  converted: 'bg-purple-100 text-purple-800',
};

export function AdminPage() {
  const [session, setSession] = useState(null);
  const [activeSection, setActiveSection] = useState('images');
  const [images, setImages] = useState<Image[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isCreatingArticle, setIsCreatingArticle] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadImages();
        loadArticles();
        loadLeads();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadImages();
        loadArticles();
        loadLeads();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const images = await getImages();
      setImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const articles = await getArticles();
      setArticles(articles);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const leads = await getLeads();
      setLeads(leads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async (imageUrl: string) => {
    await loadImages();
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

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsCreatingArticle(true);
  };

  const handleDeleteArticle = async (article: Article) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      await deleteArticle(article.id);
      loadArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article');
    }
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      if (article.status === 'published') {
        await unpublishArticle(article.id);
      } else {
        await publishArticle(article.id);
      }
      loadArticles();
    } catch (error) {
      console.error('Error toggling article publish status:', error);
      alert('Error updating article status');
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      loadLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error updating lead status');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      await deleteLead(leadId);
      loadLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Error deleting lead');
    }
  };

  if (!session) {
    return <Auth />;
  }

  const renderEmptyState = (section: typeof SECTIONS[0], actionButton?: React.ReactNode) => (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <section.Icon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {section.name}
      </h3>
      <p className="mt-2 text-gray-500">
        {section.description}
      </p>
      {actionButton && (
        <div className="mt-4">
          {actionButton}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    const section = SECTIONS.find((s) => s.id === activeSection);
    if (!section) return null;

    switch (activeSection) {
      case 'images':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
                />
              </div>
              <ImageUpload onUploadComplete={handleUploadComplete} />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexius-teal mx-auto"></div>
                <p className="mt-4 text-nexius-charcoal">Loading images...</p>
              </div>
            ) : images.length === 0 ? (
              renderEmptyState(section, (
                <ImageUpload onUploadComplete={handleUploadComplete} />
              ))
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images
                  .filter((image) =>
                    image.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((image) => (
                    <div
                      key={image.id}
                      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square relative">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDeleteImage(image)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 truncate">
                          {image.title}
                        </h3>
                        {image.description && (
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {image.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      case 'articles':
        if (isCreatingArticle) {
          return (
            <ArticleEditor
              onSave={handleSaveArticle}
              article={editingArticle}
              onCancel={() => {
                setIsCreatingArticle(false);
                setEditingArticle(null);
              }}
            />
          );
        }

        return (
          <div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexius-teal mx-auto"></div>
                <p className="mt-4 text-nexius-charcoal">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              renderEmptyState(section, (
                <button
                  onClick={() => setIsCreatingArticle(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </button>
              ))
            ) : (
              <div className="grid gap-6">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {article.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : article.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{article.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {new Date(article.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePublish(article)}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                              article.status === 'published'
                                ? 'text-yellow-600 hover:text-yellow-700'
                                : 'text-green-600 hover:text-green-700'
                            }`}
                          >
                            {article.status === 'published' ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="px-3 py-1 text-sm font-medium text-nexius-teal hover:text-nexius-teal/90"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article)}
                            className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'store':
        return renderEmptyState(section, (
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        ));

      case 'courses':
        return renderEmptyState(section, (
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </button>
        ));

      case 'case-studies':
        return renderEmptyState(section, (
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Case Study
          </button>
        ));

      case 'events':
        return renderEmptyState(section, (
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nexius-teal hover:bg-nexius-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nexius-teal"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </button>
        ));

      case 'leads':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexius-teal focus:border-nexius-teal"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexius-teal mx-auto"></div>
                <p className="mt-4 text-nexius-charcoal">Loading leads...</p>
              </div>
            ) : leads.length === 0 ? (
              renderEmptyState(section)
            ) : (
              <div className="grid gap-6">
                {leads
                  .filter((lead) =>
                    `${lead.first_name} ${lead.last_name} ${lead.email}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {lead.first_name} {lead.last_name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <a href={`mailto:${lead.email}`} className="hover:text-nexius-teal">
                                  {lead.email}
                                </a>
                              </div>
                              {lead.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  <a href={`tel:${lead.phone}`} className="hover:text-nexius-teal">
                                    {lead.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${LEAD_STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-800'}`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                        </div>
                        
                        {lead.message && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <MessageSquare className="h-4 w-4" />
                              <span className="font-medium">Message:</span>
                            </div>
                            <p className="text-gray-600 pl-6">{lead.message}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {new Date(lead.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <button
                                onClick={() => {
                                  const select = document.createElement('select');
                                  select.innerHTML = `
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="unqualified">Unqualified</option>
                                    <option value="converted">Converted</option>
                                  `;
                                  select.value = lead.status;
                                  select.onchange = (e) => handleUpdateLeadStatus(lead.id, (e.target as HTMLSelectElement).value);
                                  select.click();
                                }}
                                className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg: px-8">
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