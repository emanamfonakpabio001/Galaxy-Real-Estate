import React, { useState, useEffect } from 'react';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { AdminTab } from './AdminSidebar';
import { AdminDashboardHome } from './AdminDashboardHome';
import { PropertiesManager } from './PropertiesManager';
import { PropertyEditor } from './PropertyEditor';
import { MediaLibrary } from './MediaLibrary';
import { HomepageManager } from './HomepageManager';
import { AboutManager } from './AboutManager';
import { ServicesManager } from './ServicesManager';
import { TestimonialsManager } from './TestimonialsManager';
import { InquiriesManager } from './InquiriesManager';
import { ContactManager } from './ContactManager';
import { WhatsAppManager } from './WhatsAppManager';
import { SEOManager } from './SEOManager';
import { SettingsManager } from './SettingsManager';
import { AdminProfile } from './AdminProfile';
import { ActivityLogManager } from './ActivityLogManager';
import { BackupManager } from './BackupManager';

import { Property, Inquiry, ActivityLogItem, AdminUser } from '../../types';
import { api } from '../../services/api';

interface AdminDashboardProps {
  onViewPublicSite: () => void;
  onPreviewProperty: (property: Property) => void;
  formatNaira: (amount: number) => string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onViewPublicSite,
  onPreviewProperty,
  formatNaira,
}) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Core Data
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Property Editor State (null for new, Property for editing)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Check auth session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoadingAuth(true);
      const res = await api.auth.me();
      if (res.success && res.user) {
        setCurrentUser(res.user);
        await loadAllDashboardData();
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      setCurrentUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  const loadAllDashboardData = async () => {
    try {
      const [propRes, inqRes, actRes] = await Promise.all([
        api.properties.getAdminAll().catch(() => ({ data: [] })),
        api.inquiries.getAdminAll().catch(() => ({ data: [] })),
        api.activity.get().catch(() => ({ data: [] })),
      ]);
      setProperties(propRes.data || []);
      setInquiries(inqRes.data || []);
      setActivityLogs(actRes.data || []);
    } catch (err) {
      console.error('Error loading admin dataset:', err);
    }
  };

  const handleLoginSuccess = async (user: AdminUser) => {
    setCurrentUser(user);
    setIsLocked(false);
    await loadAllDashboardData();
  };

  const handleLockDashboard = () => {
    setIsLocked(true);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
    setIsLocked(false);
  };

  // Property Handlers
  const handleAddNewProperty = () => {
    setEditingProperty(null);
    setActiveTab('add-property');
  };

  const handleEditProperty = (prop: Property) => {
    setEditingProperty(prop);
    setActiveTab('add-property');
  };

  const handleSaveProperty = async (data: Partial<Property>) => {
    if (editingProperty) {
      await api.properties.update(editingProperty.id, data);
    } else {
      await api.properties.create(data);
    }
    await loadAllDashboardData();
    setActiveTab('properties');
  };

  const handleDuplicateProperty = async (id: string) => {
    await api.properties.duplicate(id);
    await loadAllDashboardData();
  };

  const handleDeleteProperty = async (id: string) => {
    await api.properties.delete(id);
    await loadAllDashboardData();
  };

  const handleTogglePublish = async (prop: Property) => {
    const isPublished = prop.published !== false;
    await api.properties.update(prop.id, { published: !isPublished });
    await loadAllDashboardData();
  };

  const handleToggleFeatured = async (prop: Property) => {
    await api.properties.update(prop.id, { featured: !prop.featured });
    await loadAllDashboardData();
  };

  const handleSelectInquiryFromDashboard = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setActiveTab('inquiries');
  };

  // If checking session or not logged in or locked
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#071324] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#D4A84F] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Checking Admin Access...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || isLocked) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToSite={onViewPublicSite}
      />
    );
  }

  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'New').length;

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={(tab) => {
        if (tab === 'add-property' && activeTab !== 'add-property') {
          setEditingProperty(null);
        }
        setActiveTab(tab);
      }}
      onLockDashboard={handleLockDashboard}
      onLogout={handleLogout}
      onViewPublicSite={onViewPublicSite}
      user={currentUser}
      unreadInquiriesCount={unreadInquiriesCount}
    >
      {activeTab === 'dashboard' && (
        <AdminDashboardHome
          properties={properties}
          inquiries={inquiries}
          activityLogs={activityLogs}
          onSelectTab={setActiveTab}
          onEditProperty={handleEditProperty}
          onSelectInquiry={handleSelectInquiryFromDashboard}
          formatNaira={formatNaira}
        />
      )}

      {activeTab === 'properties' && (
        <PropertiesManager
          properties={properties}
          onAddNew={handleAddNewProperty}
          onEdit={handleEditProperty}
          onDuplicate={handleDuplicateProperty}
          onDelete={handleDeleteProperty}
          onTogglePublish={handleTogglePublish}
          onToggleFeatured={handleToggleFeatured}
          onPreview={onPreviewProperty}
          formatNaira={formatNaira}
        />
      )}

      {activeTab === 'add-property' && (
        <PropertyEditor
          initialProperty={editingProperty}
          onSave={handleSaveProperty}
          onCancel={() => setActiveTab('properties')}
          onPreview={onPreviewProperty}
        />
      )}

      {activeTab === 'media' && <MediaLibrary />}

      {activeTab === 'homepage' && <HomepageManager />}

      {activeTab === 'about' && <AboutManager />}

      {activeTab === 'services' && <ServicesManager />}

      {activeTab === 'testimonials' && <TestimonialsManager />}

      {activeTab === 'inquiries' && (
        <InquiriesManager
          inquiries={inquiries}
          onRefresh={loadAllDashboardData}
          selectedInquiryFromDashboard={selectedInquiry}
        />
      )}

      {activeTab === 'contact' && <ContactManager />}

      {activeTab === 'whatsapp' && <WhatsAppManager />}

      {activeTab === 'seo' && <SEOManager />}

      {activeTab === 'settings' && <SettingsManager />}

      {activeTab === 'profile' && (
        <AdminProfile
          user={currentUser}
          onUpdateUser={(updated) => setCurrentUser(updated)}
        />
      )}

      {activeTab === 'activity' && <ActivityLogManager />}

      {activeTab === 'backup' && <BackupManager />}

    </AdminLayout>
  );
};
