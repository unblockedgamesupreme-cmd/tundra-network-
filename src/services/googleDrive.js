import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Reuse or initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Google Auth Provider configured with Google Drive scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken = null;

/**
 * Initialize Auth state listener
 */
export const initAuth = (onAuthSuccess, onAuthFailure) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google Popup
 */
export const googleSignIn = async () => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain access token from Google authentication.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory access token
 */
export const getAccessToken = () => {
  return cachedAccessToken;
};

/**
 * Sign out user and clear in-memory token
 */
export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Google Drive API: List files
 */
export const listDriveFiles = async (pageSize = 20, searchQuery = '') => {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive.');

  let q = "trashed = false";
  if (searchQuery.trim()) {
    const escaped = searchQuery.replace(/'/g, "\\'");
    q += ` and name contains '${escaped}'`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,iconLink)&q=${encodeURIComponent(q)}&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Failed to fetch Google Drive files');
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Google Drive API: Save or Update game backup JSON file
 */
export const saveGameBackupToDrive = async (backupData, fileName = 'tundra_games_backup.json') => {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive.');

  // Check if file already exists in Drive
  const existingFiles = await listDriveFiles(5, `name = '${fileName}'`);
  const content = JSON.stringify(backupData, null, 2);

  if (existingFiles.length > 0) {
    const fileId = existingFiles[0].id;
    // Update existing file
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: content,
    });

    if (!response.ok) {
      throw new Error('Failed to update existing backup file in Google Drive');
    }

    return await response.json();
  } else {
    // Create new file with multipart upload
    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      description: 'Tundra Network Unblocked Games Portal Backup',
    };

    const boundary = 'foo_bar_baz';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      content +
      closeDelimiter;

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!response.ok) {
      throw new Error('Failed to upload new backup file to Google Drive');
    }

    return await response.json();
  }
};

/**
 * Google Drive API: Download / read file content by file ID
 */
export const readDriveFileContent = async (fileId) => {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive.');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to read file content from Google Drive');
  }

  return await response.json();
};

/**
 * Google Drive API: Delete file (with mandatory user confirmation prompt handled in UI)
 */
export const deleteDriveFile = async (fileId) => {
  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive.');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete file from Google Drive');
  }

  return true;
};
