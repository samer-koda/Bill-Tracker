import { useState, useCallback, useRef, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { findDriveFile, readFromDrive, saveToDrive, getOrCreateFolder } from '../lib/driveSync';
import { Bill } from '../types';

export function useDriveSync(bills: Bill[], setBills: (bills: Bill[]) => void) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [driveFileLink, setDriveFileLink] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [autoSyncing, setAutoSyncing] = useState<boolean>(false);
  const [lastSavedBillsJSON, setLastSavedBillsJSON] = useState<string>('');
  const [userProfile, setUserProfile] = useState<{ name: string, email: string, picture: string } | null>(null);
  const skipNextSyncRef = useRef<boolean>(false);

  const checkInitialSync = useCallback(async (token: string) => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncMessage(null);
    try {
      const fileInfo = await findDriveFile(token);
      if (fileInfo) {
        setDriveFileId(fileInfo.id);
        if (fileInfo.webViewLink) setDriveFileLink(fileInfo.webViewLink);
        const remoteBills = await readFromDrive(token, fileInfo.id);
        const remoteArray = Array.isArray(remoteBills) ? remoteBills : [];
        
        skipNextSyncRef.current = true;
        setBills(remoteArray);
        setLastSavedBillsJSON(JSON.stringify(remoteArray));
        setLastSyncTime(new Date());
      } else {
         skipNextSyncRef.current = true;
         setBills([]);
         setLastSavedBillsJSON('[]');
      }
    } catch (e: any) {
      console.error(e);
      setSyncError(e.message || 'Failed to check drive');
    } finally {
      setIsSyncing(false);
    }
  }, [setBills]);

  const rawLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAccessToken(tokenResponse.access_token);
      let pface = null;
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          pface = {
            name: data.name,
            email: data.email,
            picture: data.picture
          };
          setUserProfile(pface);
        }
      } catch (e) {
        console.error('Failed to fetch user profile', e);
      }
      
      localStorage.setItem('drive_sync_session', JSON.stringify({
        token: tokenResponse.access_token,
        profile: pface,
        timestamp: Date.now()
      }));

      await checkInitialSync(tokenResponse.access_token);
    },
    onError: (errorResponse) => {
        setSyncError(errorResponse.error_description || 'OAuth Login Failed');
    },
    scope: 'https://www.googleapis.com/auth/drive.file profile email',
  });

  // Restore session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('drive_sync_session');
    if (savedSession) {
      try {
        const { token, profile, timestamp } = JSON.parse(savedSession);
        // Valid for ~55 mins
        if (Date.now() - timestamp < 3300000) {
          setAccessToken(token);
          setUserProfile(profile);
          checkInitialSync(token);
        } else {
          localStorage.removeItem('drive_sync_session');
        }
      } catch (e) {
        // ignore
      }
    }
  }, [checkInitialSync]);

  const login = () => {
    // @ts-ignore
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
       setSyncError('Missing VITE_GOOGLE_CLIENT_ID in environment variables.');
       return;
    }
    rawLogin();
  };

  const manualSync = async () => {
    if (!accessToken) return;
    setIsSyncing(true);
    setSyncError(null);
    setSyncMessage(null);
    try {
      if (driveFileId) {
        const saveRes = await saveToDrive(accessToken, bills, driveFileId);
        if (saveRes.webViewLink) setDriveFileLink(saveRes.webViewLink);
      } else {
        const folderId = await getOrCreateFolder(accessToken);
        const saveRes = await saveToDrive(accessToken, bills, null, folderId);
        setDriveFileId(saveRes.id);
        if (saveRes.webViewLink) setDriveFileLink(saveRes.webViewLink);
      }
      setLastSyncTime(new Date());
      setLastSavedBillsJSON(JSON.stringify(bills));
      setSyncMessage('Manual sync completed successfully.');
    } catch(e: any) {
      console.error(e);
      setSyncError(e.message || 'Failed to sync with drive');
    } finally {
      setIsSyncing(false);
    }
  };

  const autoSync = useCallback(async (currentBills: Bill[]) => {
    if (!accessToken) return;

    const currentJSON = JSON.stringify(currentBills);
    if (currentJSON === lastSavedBillsJSON) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    setAutoSyncing(true);
    try {
      let targetFileId = driveFileId;
      if (!targetFileId) {
        const folderId = await getOrCreateFolder(accessToken);
        const saveRes = await saveToDrive(accessToken, currentBills, null, folderId);
        setDriveFileId(saveRes.id);
        targetFileId = saveRes.id;
        if (saveRes.webViewLink) setDriveFileLink(saveRes.webViewLink);
      } else {
        await saveToDrive(accessToken, currentBills, targetFileId);
      }
      setLastSyncTime(new Date());
      setLastSavedBillsJSON(currentJSON);
    } catch (e: any) {
      console.error('Auto-sync failed:', e);
    } finally {
      setAutoSyncing(false);
    }
  }, [accessToken, driveFileId, lastSavedBillsJSON]);

  const logout = () => {
    setAccessToken(null);
    setDriveFileId(null);
    setDriveFileLink(null);
    setLastSyncTime(null);
    setLastSavedBillsJSON('');
    setUserProfile(null);
    setBills([]); // Also clear bills on logout
    localStorage.removeItem('drive_sync_session');
  };

  return {
    login,
    logout,
    accessToken,
    isSyncing,
    autoSyncing,
    lastSyncTime,
    manualSync,
    autoSync,
    syncError,
    syncMessage,
    driveFileLink,
    driveFileId,
    userProfile
  };
}
