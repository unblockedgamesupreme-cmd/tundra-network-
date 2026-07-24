import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  CloudUpload,
  CloudDownload,
  Folder,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  listDriveFiles,
  saveGameBackupToDrive,
  readDriveFileContent,
  deleteDriveFile,
} from '../services/googleDrive';

export const GoogleDriveModal = ({
  isOpen,
  onClose,
  favorites,
  customGames,
  onRestoreBackup,
}) => {
  const [user, setUser] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('backup'); // 'backup' or 'files'
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [fileSearch, setFileSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [isProcessing, setIsProcessing] = useState(false);

  // Destructive delete confirmation modal state
  const [fileToDelete, setFileToDelete] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currUser) => {
        setUser(currUser);
        fetchFiles();
      },
      () => {
        setUser(null);
        setFiles([]);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setStatusMessage({ type: 'success', text: `Signed in successfully as ${result.user.displayName || result.user.email}` });
        fetchFiles();
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Google Sign-In failed. Please try again.' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
      setUser(null);
      setFiles([]);
      setStatusMessage({ type: 'success', text: 'Signed out of Google Drive.' });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const driveFiles = await listDriveFiles(30, fileSearch);
      setFiles(driveFiles);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSaveBackup = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const backupData = {
        app: 'Tundra Network Games Portal',
        timestamp: new Date().toISOString(),
        favorites: favorites || [],
        customGames: customGames || [],
      };

      await saveGameBackupToDrive(backupData, 'tundra_games_backup.json');
      setStatusMessage({
        type: 'success',
        text: 'Backup saved to Google Drive as tundra_games_backup.json!',
      });
      fetchFiles();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save backup to Google Drive.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreBackup = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const backupFiles = await listDriveFiles(5, "name = 'tundra_games_backup.json'");
      if (backupFiles.length === 0) {
        setStatusMessage({
          type: 'error',
          text: 'No tundra_games_backup.json backup found in your Google Drive.',
        });
        return;
      }

      const backupContent = await readDriveFileContent(backupFiles[0].id);
      if (backupContent && (backupContent.favorites || backupContent.customGames)) {
        if (onRestoreBackup) {
          onRestoreBackup(backupContent);
        }
        setStatusMessage({
          type: 'success',
          text: `Backup restored! (${backupContent.favorites?.length || 0} favorites, ${backupContent.customGames?.length || 0} custom games loaded).`,
        });
      } else {
        throw new Error('Invalid backup file format');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to restore backup from Google Drive.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeleteFile = (file) => {
    setFileToDelete(file);
  };

  const executeDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsProcessing(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setStatusMessage({
        type: 'success',
        text: `Deleted "${fileToDelete.name}" from Google Drive.`,
      });
      setFileToDelete(null);
      fetchFiles();
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to delete file from Google Drive.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-sky-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-sky-500/20 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-sky-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                Google Drive Storage & Sync
              </h2>
              <p className="text-xs text-sky-300/80">
                Backup game libraries, sync playlists, and manage files in Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-sky-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span className="flex-1">{statusMessage.text}</span>
              <button onClick={() => setStatusMessage(null)} className="p-1 hover:opacity-75">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* User Sign-In Banner */}
          {!user ? (
            <div className="p-6 bg-slate-950/80 border border-sky-500/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center border border-sky-500/30 text-sky-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Connect Your Google Drive Account</h3>
                <p className="text-xs text-sky-300/80 max-w-sm">
                  Sign in with Google to backup your favorites and game progress directly to your Google Drive space securely.
                </p>
              </div>

              {/* Official Standard Google Sign In Button */}
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button hover:scale-105 transition-transform cursor-pointer"
                style={{
                  backgroundColor: '#131314',
                  borderRadius: '12px',
                  border: '1px solid #444746',
                  padding: '10px 16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#e3e3e3',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <div className="gsi-material-button-icon" style={{ width: '20px', height: '20px' }}>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
                <span>{isLoggingIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Logged In User Pill */}
              <div className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-sky-500/20 rounded-2xl">
                <div className="flex items-center space-x-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-9 h-9 rounded-full border border-sky-400" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400 flex items-center justify-center font-bold text-sm">
                      {user.displayName ? user.displayName[0] : 'U'}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{user.displayName || 'Google Drive User'}</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                        Connected
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-300/70">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Tabs Navigation */}
              <div className="flex border-b border-sky-500/20">
                <button
                  onClick={() => setActiveTab('backup')}
                  className={`pb-2.5 px-4 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'backup'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-sky-200/60 hover:text-sky-200'
                  }`}
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>Cloud Backup & Sync</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('files');
                    fetchFiles();
                  }}
                  className={`pb-2.5 px-4 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'files'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-sky-200/60 hover:text-sky-200'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>Google Drive Files</span>
                </button>
              </div>

              {/* Tab 1: Backup & Sync */}
              {activeTab === 'backup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                  {/* Save Backup Card */}
                  <div className="p-5 bg-slate-950/80 border border-sky-500/20 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400 w-fit">
                        <CloudUpload className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-extrabold text-white">Save Backup to Drive</h3>
                      <p className="text-xs text-sky-300/80 leading-relaxed">
                        Upload your favorite games list ({favorites?.length || 0}) and custom added games ({customGames?.length || 0}) to Google Drive as <code className="text-sky-300 font-mono bg-slate-900 px-1 py-0.5 rounded">tundra_games_backup.json</code>.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveBackup}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
                      <span>Upload Backup</span>
                    </button>
                  </div>

                  {/* Restore Backup Card */}
                  <div className="p-5 bg-slate-950/80 border border-indigo-500/20 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 w-fit">
                        <CloudDownload className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-extrabold text-white">Restore Backup from Drive</h3>
                      <p className="text-xs text-sky-300/80 leading-relaxed">
                        Download your existing <code className="text-indigo-300 font-mono bg-slate-900 px-1 py-0.5 rounded">tundra_games_backup.json</code> from Google Drive and sync favorites & game catalog across devices.
                      </p>
                    </div>

                    <button
                      onClick={handleRestoreBackup}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                      <span>Restore Backup</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Google Drive File Explorer */}
              {activeTab === 'files' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchFiles()}
                        placeholder="Search files in Google Drive..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-sky-500/30 rounded-xl text-xs text-sky-100 placeholder-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                      />
                    </div>
                    <button
                      onClick={fetchFiles}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-xl transition-all border border-slate-700"
                      title="Refresh file list"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Files List */}
                  <div className="bg-slate-950/90 border border-sky-500/20 rounded-2xl divide-y divide-sky-500/10 max-h-60 overflow-y-auto">
                    {isLoadingFiles ? (
                      <div className="p-8 text-center text-xs text-sky-400 flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Loading Google Drive files...</span>
                      </div>
                    ) : files.length === 0 ? (
                      <div className="p-8 text-center text-xs text-sky-300/60 space-y-1">
                        <Folder className="w-6 h-6 mx-auto text-sky-500/40" />
                        <p>No files found in Google Drive matching query.</p>
                      </div>
                    ) : (
                      files.map((file) => (
                        <div key={file.id} className="p-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                          <div className="flex items-center space-x-3 truncate">
                            <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{file.name}</p>
                              <p className="text-[10px] text-sky-300/60 font-mono">
                                Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-sky-400 hover:text-sky-200 hover:bg-sky-500/10 rounded-lg transition-all"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => confirmDeleteFile(file)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sky-500/20 bg-slate-900/90 flex items-center justify-between text-[11px] text-sky-300/70">
          <span>Google Workspace Integration &bull; Drive API v3</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-200 font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory Explicit Confirmation Dialog for Destructive Operations (File Delete) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/40 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-extrabold text-white">Confirm Delete File</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white font-mono">{fileToDelete.name}</strong> from your Google Drive? This operation cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteFile}
                disabled={isProcessing}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
