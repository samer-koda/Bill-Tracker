const FILE_NAME = 'billtracker_data.json';
const FOLDER_NAME = 'BillTrackerApp';

export async function getOrCreateFolder(accessToken: string): Promise<string> {
  const q = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to create Google Drive folder Response:', text);
    throw new Error(`Failed to create Google Drive folder: ${res.statusText}`);
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  const createRes = await fetch(`https://www.googleapis.com/drive/v3/files`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['root']
    })
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    console.error('Failed to create folder Response:', text);
    throw new Error(`Failed to create folder: ${createRes.statusText}`);
  }
  const createData = await createRes.json();
  return createData.id;
}

export async function findDriveFile(accessToken: string): Promise<{ id: string, webViewLink?: string } | null> {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to find Drive file:', text);
    throw new Error('Failed to find Drive file: ' + res.statusText);
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return { id: data.files[0].id, webViewLink: data.files[0].webViewLink };
  }
  return null;
}

export async function readFromDrive(accessToken: string, fileId: string) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to read Drive file:', text);
    throw new Error('Failed to read Drive file: ' + res.statusText);
  }
  return await res.json();
}

export async function saveToDrive(accessToken: string, data: any, fileId: string | null, folderId?: string) {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close_delim = `\r\n--${boundary}--`;

  const metadata: any = { name: FILE_NAME, mimeType: 'application/json' };
  if (!fileId && folderId) {
    metadata.parents = [folderId];
  }
  
  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(data) +
    close_delim;

  const url = fileId 
    ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&fields=id,webViewLink`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink`;
    
  const res = await fetch(url, {
    method: fileId ? 'PATCH' : 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error('Failed to save to Drive response:', text);
    throw new Error(`Failed to save to Drive: ${res.statusText}`);
  }
  return await res.json();
}
