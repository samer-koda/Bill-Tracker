/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useBills } from './hooks/useBills';
import { useDriveSync } from './hooks/useDriveSync';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { AddBillModal } from './components/AddBillModal';
import { List, Calendar as CalendarIcon, Settings, Plus, RefreshCw, CloudUpload } from 'lucide-react';
import { Bill } from './types';
import { cn, generateId } from './lib/utils';

export default function App() {
  const { bills, setBills, addBill, updateBill, deleteBill, togglePaid, setUseLocalStorage } = useBills();
  const driveSync = useDriveSync(bills, setBills);
  
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'settings'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | undefined>();

  // Toggle local storage based on Drive connection
  useEffect(() => {
    setUseLocalStorage(!driveSync.accessToken);
  }, [driveSync.accessToken, setUseLocalStorage]);

  // Auto-sync whenever bills change, if connected
  useEffect(() => {
    if (driveSync.accessToken && driveSync.driveFileId) {
       driveSync.autoSync(bills);
    }
  }, [bills, driveSync.accessToken, driveSync.driveFileId]);

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleSave = async (billData: Omit<Bill, 'id'>) => {
    if (editingBill) {
      updateBill(editingBill.id, billData);
    } else {
      addBill(billData);
    }
    // We defer the manual sync to the next cycle so state has updated. But since JS is synchronous,
    // a better approach is to rely on a user action or an effect in the hook.
    // For now, we'll let it sync manually or automatically if we want to hook it up.
  };

  const handleOpenModal = () => {
    setEditingBill(undefined);
    setIsModalOpen(true);
  };

  const handleImport = (importedBills: Bill[]) => {
    // Generate new IDs or merge logically. For simplicity, just appending.
    setBills(prev => [...prev, ...importedBills.map(b => ({ ...b, id: generateId() }))]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-end px-4 md:px-8 mt-6 mb-6 max-w-7xl mx-auto w-full shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">BillTracker</h1>
          <p className="text-slate-500 font-medium">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        {activeTab !== 'settings' && (
          <button 
            onClick={handleOpenModal}
            className="flex flex-shrink-0 items-center justify-center gap-1.5 md:hidden bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-full text-sm font-bold transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
               {driveSync.accessToken && driveSync.userProfile ? driveSync.userProfile.name : "Cloud Sync"}
            </p>
            {driveSync.accessToken ? (
              <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
                 {driveSync.isSyncing && <RefreshCw className="w-3 h-3 animate-spin" />}
                 {driveSync.autoSyncing && !driveSync.isSyncing && <CloudUpload className="w-3 h-3 animate-pulse" />}
                 {driveSync.pendingSyncChoice ? "Drive Setup Pending" : "Google Drive Active"}
              </p>
            ) : (
              <p className="text-sm font-semibold text-emerald-600">Local Storage Active</p>
            )}
          </div>
          {driveSync.accessToken ? (
             driveSync.userProfile ? (
                 <img src={driveSync.userProfile.picture} alt={driveSync.userProfile.name} className="w-10 h-10 rounded-full object-cover border border-indigo-200 shadow-sm shrink-0" title={driveSync.userProfile.name} />
             ) : (
                 <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">@</div>
             )
          ) : (
             <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold shrink-0">L</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-32 md:pb-8 overflow-y-auto">
        {activeTab === 'list' && (
          <ListView 
            bills={bills} 
            onTogglePaid={togglePaid} 
            onEdit={handleEdit} 
            onDelete={deleteBill} 
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView 
            bills={bills} 
            onTogglePaid={togglePaid} 
            onEdit={handleEdit} 
            onDelete={deleteBill} 
          />
        )}
        {activeTab === 'settings' && (
          <SettingsView bills={bills} onImport={handleImport} driveSync={driveSync} />
        )}
      </main>

      {/* Floating Action Button (Desktop) */}
      {activeTab !== 'settings' && (
        <button
          onClick={handleOpenModal}
          className="hidden md:flex fixed bottom-8 right-8 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-3xl shadow-lg items-center justify-center transition-transform hover:scale-105 active:scale-95 transform-gpu"
          aria-label="Add Bill"
        >
          <Plus className="w-6 h-6 mr-1" />
          <span className="font-bold pr-2">Quick Add</span>
        </button>
      )}

      {/* Desktop Navigation */}
      <nav className="hidden md:flex absolute top-10 right-[300px] gap-2 lg:right-[400px]">
         <button onClick={() => setActiveTab('list')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors", activeTab === 'list' ? "bg-indigo-100 text-indigo-700" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50")}>List</button>
         <button onClick={() => setActiveTab('calendar')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors", activeTab === 'calendar' ? "bg-indigo-100 text-indigo-700" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50")}>Calendar</button>
         <button onClick={() => setActiveTab('settings')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-colors", activeTab === 'settings' ? "bg-indigo-100 text-indigo-700" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50")}>Settings</button>
      </nav>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 w-full z-30 pb-safe md:hidden">
        <div className="max-w-md mx-auto flex justify-around">
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "flex flex-col items-center justify-center w-full py-3 transition-colors text-xs font-medium border-t-2",
              activeTab === 'list' ? "text-indigo-600 border-indigo-600" : "text-slate-500 hover:text-slate-900 border-transparent"
            )}
          >
            <List className={cn("w-6 h-6 mb-1", activeTab === 'list' ? "text-indigo-600" : "")} />
            List
          </button>
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "flex flex-col items-center justify-center w-full py-3 transition-colors text-xs font-medium border-t-2",
              activeTab === 'calendar' ? "text-indigo-600 border-indigo-600" : "text-slate-500 hover:text-slate-900 border-transparent"
            )}
          >
            <CalendarIcon className={cn("w-6 h-6 mb-1", activeTab === 'calendar' ? "text-indigo-600" : "")} />
            Calendar
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex flex-col items-center justify-center w-full py-3 transition-colors text-xs font-medium border-t-2",
              activeTab === 'settings' ? "text-indigo-600 border-indigo-600" : "text-slate-500 hover:text-slate-900 border-transparent"
            )}
          >
            <Settings className={cn("w-6 h-6 mb-1", activeTab === 'settings' ? "text-indigo-600" : "")} />
            Settings
          </button>
        </div>
      </nav>

      {/* Modals */}
      <AddBillModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingBill}
      />
    </div>
  );
}

