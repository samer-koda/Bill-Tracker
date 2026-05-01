import React from 'react';
import { Bill } from '../types';
import { Download, Upload, Info, Cloud, RefreshCw, LogOut } from 'lucide-react';

interface Props {
  bills: Bill[];
  onImport: (bills: Bill[]) => void;
  driveSync: any;
}

export function SettingsView({ bills, onImport, driveSync }: Props) {
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bills, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `bills_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedBills = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedBills)) {
          if (window.confirm('This will append imported bills to your existing list. Do you want to continue?')) {
            onImport(importedBills);
            alert('Import successful!');
          }
        } else {
          alert('Invalid file format. Please upload a valid JSON backup.');
        }
      } catch (err) {
        alert('Error parsing file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="pb-24 md:pb-8 w-full space-y-6">
      {/* Cloud Sync Section */}
      <div className={`col-span-1 lg:col-span-2 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm border ${driveSync.accessToken ? "bg-indigo-50 border-indigo-100" : "bg-emerald-50 border-emerald-100"}`}>
        {driveSync.pendingSyncChoice ? (
           <div className="w-full">
              <h2 className="text-xl font-bold mb-3 text-indigo-900">How would you like to sync?</h2>
              {driveSync.pendingSyncChoice.hasRemote ? (
                <>
                  <p className="text-indigo-800 mb-6 font-medium">We found {driveSync.pendingSyncChoice.remoteCount} bill(s) on Google Drive, and you have {bills.length} bill(s) locally.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <button
                        onClick={() => driveSync.resolveSync('merge')}
                        disabled={driveSync.isSyncing}
                        className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm text-indigo-700 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center font-bold"
                     >
                        Merge Both
                        <span className="text-xs text-indigo-500 font-normal mt-1 text-center">Combine local and drive bills together safely.</span>
                     </button>
                     <button
                        onClick={() => driveSync.resolveSync('pull')}
                        disabled={driveSync.isSyncing}
                        className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm text-indigo-700 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center font-bold"
                     >
                        Use Drive Data
                        <span className="text-xs text-indigo-500 font-normal mt-1 text-center">Overwrite local bills with what is in Drive.</span>
                     </button>
                     <button
                        onClick={() => driveSync.resolveSync('push')}
                        disabled={driveSync.isSyncing}
                        className="p-4 bg-white rounded-xl border border-indigo-200 shadow-sm text-indigo-700 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center font-bold"
                     >
                        Use Local Data
                        <span className="text-xs text-indigo-500 font-normal mt-1 text-center">Overwrite Drive with your local bills.</span>
                     </button>
                     <button
                        onClick={() => driveSync.resolveSync('clear')}
                        disabled={driveSync.isSyncing}
                        className="p-4 bg-white rounded-xl border border-rose-200 shadow-sm text-rose-700 hover:bg-rose-50 transition-colors flex flex-col items-center justify-center font-bold"
                     >
                        Start Fresh
                        <span className="text-xs text-rose-500 font-normal mt-1 text-center">Clear both local and cloud, start empty.</span>
                     </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-indigo-800 mb-6 font-medium">No previous backup found on Drive. You have {bills.length} bill(s) locally.</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                          onClick={() => driveSync.resolveSync('push')}
                          disabled={driveSync.isSyncing}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-colors font-bold w-full sm:w-auto"
                       >
                          Upload Local Data to Drive
                    </button>
                    <button
                          onClick={() => driveSync.resolveSync('clear')}
                          disabled={driveSync.isSyncing}
                          className="px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl shadow-sm hover:bg-rose-50 transition-colors font-bold w-full sm:w-auto"
                       >
                          Start Fresh (Clear Local)
                    </button>
                  </div>
                </>
              )}
           </div>
        ) : (
          <>
            <div className="flex-1 mb-6 md:mb-0">
              <h2 className={`text-xl font-bold mb-1 ${driveSync.accessToken ? "text-indigo-900" : "text-emerald-900"}`}>
                 {driveSync.accessToken ? "Google Drive Sync Active" : "Local Storage Mode"}
              </h2>
              {driveSync.accessToken ? (
                 <div className="text-sm font-medium text-indigo-700 space-y-1">
                    <p>Data synced securely with your Google Drive.</p>
                    {driveSync.lastSyncTime && <p className="opacity-80">Last synced:  {driveSync.lastSyncTime.toLocaleTimeString()}</p>}
                    {driveSync.syncError && <div className="text-rose-600 font-bold bg-rose-100 p-2 rounded-lg mt-2 inline-block"><b className="block border-b border-rose-200 mb-1 pb-1">Error</b>{driveSync.syncError}</div>}
                    {driveSync.syncMessage && 
                      <div className="text-indigo-600 font-bold bg-indigo-100 p-3 rounded-lg mt-2 inline-block">
                        <b className="block border-b border-indigo-200 mb-1 pb-1">Success</b>
                        {driveSync.syncMessage}
                        {driveSync.driveFileLink && (
                           <a href={driveSync.driveFileLink} target="_blank" rel="noopener noreferrer" className="block mt-2 text-sm underline hover:text-indigo-800 break-all bg-indigo-200/50 p-2 rounded">
                              View in Google Drive ↗
                           </a>
                        )}
                      </div>
                    }
                 </div>
              ) : (
                 <div className="text-sm font-medium text-emerald-700">
                    <p>Data saved locally. Connect Google Drive for cloud backup across devices.</p>
                    {driveSync.syncError && <p className="text-rose-600 font-bold bg-rose-100 p-2 rounded-lg mt-2 inline-block">{driveSync.syncError}</p>}
                 </div>
              )}
            </div>
            <div className="flex flex-col gap-3 md:items-end w-full md:w-auto">
               {driveSync.accessToken ? (
                 <>
                   <button 
                     onClick={driveSync.manualSync} 
                     disabled={driveSync.isSyncing}
                     className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                   >
                     {driveSync.isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                     Sync Now
                   </button>
                   <button 
                     onClick={driveSync.logout} 
                     className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-200 transition-colors"
                   >
                     <LogOut className="w-4 h-4" />
                     Disconnect Drive
                   </button>
                 </>
               ) : (
                 <div className="flex flex-col items-center md:items-end w-full">
                   <button 
                     onClick={driveSync.login}
                     disabled={driveSync.isSyncing} 
                     className="flex items-center justify-center gap-2 px-6 py-3 w-full bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                   >
                     <Cloud className="w-5 h-5" />
                     Connect Google Drive
                   </button>
                   <p className="text-xs text-emerald-800 mt-3 max-w-xs text-center md:text-right">
                     Note: If you see a warning about the app being unverified, click <span className="font-bold">Advanced</span> &gt; <span className="font-bold">Go to App</span> to continue. Make sure your email is added as a test user in Google Cloud Console.
                   </p>
                 </div>
               )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Export Data */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-6">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Export Data</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Download a copy of your bills to your device.</p>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors w-full justify-center"
          >
            Download JSON Backup
          </button>
        </div>

        {/* Import Data */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-6">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Import Data</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">Restore your bills from a previously downloaded file.</p>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 outline-none text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors w-full justify-center pointer-events-none">
              Select Backup File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
