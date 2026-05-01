import React from 'react';
import { Bill } from '../types';
import { Cloud, LogOut } from 'lucide-react';

interface Props {
  bills: Bill[];
  driveSync: any;
}

export function SettingsView({ bills, driveSync }: Props) {
  return (
    <div className="pb-24 md:pb-8 w-full space-y-6">
      {/* Cloud Sync Section */}
      <div className={`col-span-1 lg:col-span-2 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm border ${driveSync.accessToken ? "bg-indigo-50 border-indigo-100" : "bg-emerald-50 border-emerald-100"}`}>
        <div className="flex-1 mb-6 md:mb-0">
          <h2 className={`text-xl font-bold mb-1 ${driveSync.accessToken ? "text-indigo-900" : "text-emerald-900"}`}>
             {driveSync.accessToken ? "Google Drive Sync Active" : "Logged Out Mode"}
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
                <p>You must connect Google Drive to save bills.</p>
                {driveSync.syncError && <p className="text-rose-600 font-bold bg-rose-100 p-2 rounded-lg mt-2 inline-block">{driveSync.syncError}</p>}
             </div>
          )}
        </div>
        <div className="flex flex-col gap-3 md:items-end w-full md:w-auto">
           {driveSync.accessToken ? (
             <button 
               onClick={driveSync.logout} 
               className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-200 transition-colors"
             >
               <LogOut className="w-4 h-4" />
               Log Out
             </button>
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
      </div>
    </div>
  );
}
