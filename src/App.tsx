/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from './firebase';
import { 
  Search, 
  Menu, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  ArrowLeft,
  Plus,
  LogOut,
  User as UserIcon,
  Settings,
  Shield,
  Users,
  CircleDashed,
  Camera,
  X,
  Calendar,
  Globe,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  Link as LinkIcon,
  Edit2,
  Check,
  Lock,
  Unlock,
  UserCheck,
  UserMinus,
  MessageCircleOff,
  VolumeX,
  Share2,
  Heart,
  ThumbsUp,
  MessageCircle,
  Frown,
  ThumbsDown,
  UserCog,
  ExternalLink,
  ChevronLeft,
  UserPlus,
  MicOff,
  Mic,
  VideoOff,
  Play,
  Download,
  Music,
  Package,
  File as FileIcon,
  CheckCircle2,
  Info,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { cn } from './lib/utils';

// --- Types ---
interface User {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  phoneNumber?: string;
  birthday?: string;
  country?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  snapchat?: string;
  pinterest?: string;
  youtube?: string;
  lastSeen?: any;
  blockedUsers?: string[];
  blockedGroups?: string[];
}

interface Chat {
  id: string;
  type: 'private' | 'group' | 'channel';
  name?: string;
  photoURL?: string;
  lastMessage?: string;
  lastMessageAt?: any;
  members: string[];
  createdBy: string;
  managers?: string[];
  isPublic?: boolean;
  isChatLocked?: boolean;
  isCallsLocked?: boolean;
  isAddMembersLocked?: boolean;
  isShareLocked?: boolean;
  isReactionsLocked?: boolean;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  createdAt: any;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'app' | 'film';
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
}

interface Status {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  imageUrl: string;
  text?: string;
  createdAt: any;
}

// --- Components ---

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        email: user.email || '',
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setupRecaptcha();
    const appVerifier = (window as any).recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      setError(err.message);
      if (appVerifier) appVerifier.clear();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.phoneNumber || 'Phone User',
        photoURL: '',
        email: '',
        phoneNumber: user.phoneNumber,
        lastSeen: serverTimestamp()
      }, { merge: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-8 max-w-md w-full"
      >
        <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto shadow-2xl border border-gray-800">
          <Flame className="w-12 h-12 text-[#FF3B30]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">DevilChat</h1>
          <p className="text-gray-400">The world's fastest messaging app. It is free and secure.</p>
        </div>

        {!confirmationResult ? (
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="tel"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[#2c2c2c] text-white rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition-all"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#FF3B30] hover:bg-[#D00000] disabled:opacity-50 transition-colors rounded-xl font-semibold shadow-lg"
            >
              {loading ? 'Sending...' : 'Continue with Phone'}
            </button>
            <div id="recaptcha-container"></div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input 
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full bg-[#2c2c2c] text-white rounded-xl py-4 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition-all text-center text-2xl tracking-widest"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-[#FF3B30] hover:bg-[#D00000] disabled:opacity-50 transition-colors rounded-xl font-semibold shadow-lg"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 px-6 bg-white text-black hover:bg-gray-100 transition-colors rounded-xl font-semibold shadow-lg flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </motion.div>
    </div>
  );
};

const StatusList = ({ currentUser }: { currentUser: User }) => {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusUrl, setStatusUrl] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'statuses'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Status));
      setStatuses(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUrl.trim()) return;

    try {
      await addDoc(collection(db, 'statuses'), {
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        imageUrl: statusUrl,
        text: statusText,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      setShowAddStatus(false);
      setStatusText('');
      setStatusUrl('');
    } catch (error) {
      console.error("Failed to add status:", error);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div 
        onClick={() => setShowAddStatus(true)}
        className="flex items-center gap-4 p-4 bg-[#2c2c2c] rounded-2xl cursor-pointer hover:bg-[#3d3d3d] transition-colors"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gray-600 overflow-hidden">
            {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-3 text-gray-400" />}
          </div>
          <div className="absolute bottom-0 right-0 bg-[#FF3B30] rounded-full p-1 border-2 border-[#212121]">
            <Plus className="w-3 h-3 text-white" />
          </div>
        </div>
        <div>
          <p className="font-semibold">My Status</p>
          <p className="text-xs text-gray-400">Tap to add status update</p>
        </div>
      </div>

      <AnimatePresence>
        {showAddStatus && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-[#212121] p-4 rounded-2xl border border-[#3d3d3d] space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold">Add Status</h3>
              <button onClick={() => setShowAddStatus(false)}><X className="w-5 h-5" /></button>
            </div>
            <input 
              type="text" 
              placeholder="Image/Video URL (e.g. https://...)" 
              value={statusUrl}
              onChange={(e) => setStatusUrl(e.target.value)}
              className="w-full bg-[#2c2c2c] rounded-xl p-3 text-sm focus:outline-none"
            />
            <textarea 
              placeholder="Add a caption..." 
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              className="w-full bg-[#2c2c2c] rounded-xl p-3 text-sm focus:outline-none h-20 resize-none"
            />
            <button 
              onClick={handleAddStatus}
              className="w-full py-3 bg-[#FF3B30] rounded-xl font-bold hover:bg-[#D00000] transition-colors"
            >
              Post Status
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <p className="text-xs font-bold text-[#FF3B30] uppercase tracking-wider">Recent Updates</p>
        {statuses.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No status updates yet.</p>
        ) : (
          statuses.map(status => (
            <div key={status.id} className="flex items-center gap-4 hover:bg-[#2c2c2c] p-2 rounded-xl transition-colors cursor-pointer">
              <div className="p-[2px] rounded-full border-2 border-[#FF3B30]">
                <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden relative">
                  {status.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <img src={status.imageUrl} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{status.userName}</p>
                <p className="text-xs text-gray-400">
                  {status.text && <span className="block truncate max-w-[200px] italic mb-1">"{status.text}"</span>}
                  {status.createdAt && format(status.createdAt.toDate(), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProfileView = ({ currentUser }: { currentUser: User }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (isEditing) {
      setEditData({
        displayName: currentUser.displayName,
        email: currentUser.email,
        phoneNumber: currentUser.phoneNumber,
        birthday: currentUser.birthday,
        country: currentUser.country,
        facebook: currentUser.facebook,
        instagram: currentUser.instagram,
        tiktok: currentUser.tiktok,
        snapchat: currentUser.snapchat,
        pinterest: currentUser.pinterest,
        youtube: currentUser.youtube,
      });
    }
  }, [isEditing, currentUser]);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'users', currentUser.uid), editData, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const SocialLink = ({ icon: Icon, label, value, href }: { icon: any, label: string, value?: string, href?: string }) => {
    if (!value && !isEditing) return null;
    return (
      <div className="flex items-center gap-4 group">
        <div className="p-2 bg-[#2c2c2c] rounded-lg text-gray-400 group-hover:text-[#FF3B30] transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 border-b border-gray-800 pb-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
          {isEditing ? (
            <input 
              type="text"
              value={value || ''}
              onChange={(e) => setEditData({ ...editData, [label.toLowerCase()]: e.target.value })}
              placeholder={`Enter ${label} link`}
              className="w-full bg-transparent text-sm focus:outline-none text-white mt-1"
            />
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-white mt-1 truncate max-w-[200px]">{value}</p>
              {href && (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#FF3B30] hover:underline text-xs flex items-center gap-1">
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-black overflow-y-auto custom-scrollbar pb-20">
      <div className="relative h-64 bg-gradient-to-b from-[#FF3B30] to-black">
        <div className="absolute top-4 right-4 z-10">
          {isEditing ? (
            <button 
              onClick={handleSave}
              className="p-3 bg-[#FF3B30] text-white rounded-full shadow-lg hover:bg-[#D00000] transition-colors"
            >
              <Check className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-3 bg-white/10 backdrop-blur-md text-white rounded-full shadow-lg hover:bg-white/20 transition-colors"
            >
              <Edit2 className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-600 overflow-hidden shadow-2xl">
              {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-8 text-gray-400" />}
            </div>
            {isEditing && (
              <button className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-20 p-6 text-center space-y-2">
        {isEditing ? (
          <input 
            type="text"
            value={editData.displayName || ''}
            onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
            className="text-2xl font-bold bg-transparent border-b border-[#FF3B30] text-center focus:outline-none w-full max-w-xs mx-auto"
          />
        ) : (
          <h2 className="text-2xl font-bold">{currentUser.displayName}</h2>
        )}
        <p className="text-gray-400">{currentUser.email || currentUser.phoneNumber}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 space-y-4 shadow-lg border border-[#121212]">
          <h3 className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-2">Basic Information</h3>
          
          <div className="flex items-center gap-4">
            <Mail className="w-5 h-5 text-gray-400" />
            <div className="flex-1 border-b border-gray-800 pb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Email</p>
              {isEditing ? (
                <input 
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full bg-transparent text-sm focus:outline-none text-white mt-1"
                />
              ) : (
                <p className="text-sm text-white mt-1">{currentUser.email || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Phone className="w-5 h-5 text-gray-400" />
            <div className="flex-1 border-b border-gray-800 pb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Phone Number</p>
              {isEditing ? (
                <input 
                  type="tel"
                  value={editData.phoneNumber || ''}
                  onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                  className="w-full bg-transparent text-sm focus:outline-none text-white mt-1"
                />
              ) : (
                <p className="text-sm text-white mt-1">{currentUser.phoneNumber || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex-1 border-b border-gray-800 pb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Birthday</p>
              {isEditing ? (
                <input 
                  type="date"
                  value={editData.birthday || ''}
                  onChange={(e) => setEditData({ ...editData, birthday: e.target.value })}
                  className="w-full bg-transparent text-sm focus:outline-none text-white mt-1 color-scheme-dark"
                />
              ) : (
                <p className="text-sm text-white mt-1">{currentUser.birthday || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-gray-400" />
            <div className="flex-1 border-b border-gray-800 pb-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Country</p>
              {isEditing ? (
                <input 
                  type="text"
                  value={editData.country || ''}
                  onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                  className="w-full bg-transparent text-sm focus:outline-none text-white mt-1"
                />
              ) : (
                <p className="text-sm text-white mt-1">{currentUser.country || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 space-y-4 shadow-lg border border-[#121212]">
          <h3 className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-2">Social Links</h3>
          <SocialLink icon={Facebook} label="Facebook" value={isEditing ? editData.facebook : currentUser.facebook} href={currentUser.facebook} />
          <SocialLink icon={Instagram} label="Instagram" value={isEditing ? editData.instagram : currentUser.instagram} href={currentUser.instagram} />
          <SocialLink icon={Youtube} label="Youtube" value={isEditing ? editData.youtube : currentUser.youtube} href={currentUser.youtube} />
          <SocialLink icon={LinkIcon} label="TikTok" value={isEditing ? editData.tiktok : currentUser.tiktok} href={currentUser.tiktok} />
          <SocialLink icon={LinkIcon} label="Snapchat" value={isEditing ? editData.snapchat : currentUser.snapchat} href={currentUser.snapchat} />
          <SocialLink icon={LinkIcon} label="Pinterest" value={isEditing ? editData.pinterest : currentUser.pinterest} href={currentUser.pinterest} />
        </div>

        {/* Account Settings */}
        <div className="bg-[#0a0a0a] rounded-2xl p-4 space-y-4 shadow-lg border border-[#121212]">
          <h3 className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-2">Account</h3>
          <button className="flex items-center gap-4 w-full group">
            <div className="p-2 bg-[#2c2c2c] rounded-lg text-gray-400 group-hover:text-[#FF3B30] transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1 border-b border-gray-800 pb-2 text-left">
              <p className="text-sm text-white">Privacy and Security</p>
            </div>
          </button>
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-4 w-full group text-red-500"
          >
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Log Out</p>
            </div>
          </button>

          <button 
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-4 w-full group"
          >
            <div className="p-2 bg-[#2c2c2c] rounded-lg text-gray-400 group-hover:text-[#FF3B30] transition-colors">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-white">About DevilChat</p>
            </div>
          </button>
        </div>
      </div>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a1a] w-full max-w-sm rounded-3xl p-8 border border-[#FF3B30]/20 shadow-2xl text-center relative"
            >
              <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 p-2 hover:bg-[#2c2c2c] rounded-full text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 bg-[#FF3B30]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Flame className="w-10 h-10 text-[#FF3B30]" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">DevilChat</h2>
              <p className="text-[#FF3B30] text-sm font-medium mb-6">Version 1.0.0</p>

              <div className="space-y-4 text-gray-400 text-sm leading-relaxed mb-8">
                <p>A secure, devil-themed real-time messaging app with advanced group management.</p>
                <p>Built with React, Tailwind CSS, and Firebase for a seamless communication experience.</p>
              </div>

              <button 
                onClick={() => setShowAbout(false)}
                className="w-full py-3 bg-[#FF3B30] hover:bg-[#D00000] text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#FF3B30]/20"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ 
  currentUser, 
  onSelectChat, 
  selectedChatId, 
  onNewChat,
  activeTab,
  setActiveTab,
  setIsAccountDrawerOpen
}: { 
  currentUser: User, 
  onSelectChat: (chat: Chat) => void, 
  selectedChatId?: string,
  onNewChat: () => void,
  activeTab: string,
  setActiveTab: (tab: string) => void,
  setIsAccountDrawerOpen: (open: boolean) => void
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: User[], groups: Chat[] }>({ users: [], groups: [] });

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(chatData);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults({ users: [], groups: [] });
      return;
    }

    // Search for users and public groups
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs
        .map(doc => doc.data() as User)
        .filter(u => u.uid !== currentUser.uid && u.displayName.toLowerCase().includes(search.toLowerCase()));
      
      onSnapshot(collection(db, 'chats'), (chatSnapshot) => {
        const groups = chatSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Chat))
          .filter(c => c.type === 'group' && c.isPublic && c.name?.toLowerCase().includes(search.toLowerCase()));
        
        setSearchResults({ users, groups });
      });
    });

    return () => unsubscribeUsers();
  }, [search, currentUser.uid]);

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name?.toLowerCase().includes(search.toLowerCase()) || 
                         chat.lastMessage?.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'group') return matchesSearch && chat.type === 'group';
    if (activeTab === 'chat') return matchesSearch && chat.type === 'private';
    return matchesSearch;
  });

  const startPrivateChat = async (otherUser: User) => {
    const chatId = [currentUser.uid, otherUser.uid].sort().join('_');
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    
    if (chatDoc.exists()) {
      onSelectChat({ id: chatDoc.id, ...chatDoc.data() } as Chat);
    } else {
      const newChat: Chat = {
        id: chatId,
        type: 'private',
        name: otherUser.displayName,
        photoURL: otherUser.photoURL,
        members: [currentUser.uid, otherUser.uid],
        createdBy: currentUser.uid,
        lastMessage: '',
        lastMessageAt: serverTimestamp()
      };
      await setDoc(doc(db, 'chats', chatId), newChat);
      onSelectChat(newChat);
    }
    setSearch('');
  };

  return (
    <div className="w-full md:w-[400px] h-full flex flex-col bg-black border-r border-[#121212]">
      {/* Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF3B30]/10 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#FF3B30]" />
          </div>
          <h1 className="text-xl font-bold text-white flex-1">DevilChat</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2c2c2c] text-white rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content based on Tab */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {search.trim() ? (
          <div className="p-2 space-y-4">
            {searchResults.users.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#FF3B30] uppercase px-3 py-2 tracking-widest">Global Users</p>
                {searchResults.users.map(u => (
                  <button 
                    key={u.uid}
                    onClick={() => startPrivateChat(u)}
                    className="w-full p-3 flex items-center gap-4 hover:bg-[#2c2c2c] rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden">
                      {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-gray-400" />}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{u.displayName}</p>
                      <p className="text-xs text-gray-500">@{u.displayName.toLowerCase().replace(/\s/g, '')}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchResults.groups.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#FF3B30] uppercase px-3 py-2 tracking-widest">Public Groups</p>
                {searchResults.groups.map(g => (
                  <button 
                    key={g.id}
                    onClick={() => { onSelectChat(g); setSearch(''); }}
                    className="w-full p-3 flex items-center gap-4 hover:bg-[#2c2c2c] rounded-xl transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold">
                      {g.photoURL ? <img src={g.photoURL} alt="" className="w-full h-full object-cover rounded-full" /> : g.name?.charAt(0)}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-xs text-gray-500">{g.members.length} members • Public</p>
                    </div>
                    {!g.members.includes(currentUser.uid) && (
                      <div className="px-3 py-1 bg-[#FF3B30]/20 text-[#FF3B30] rounded-full text-[10px] font-bold">JOIN</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            {searchResults.users.length === 0 && searchResults.groups.length === 0 && (
              <div className="p-8 text-center text-gray-500">No results found for "{search}"</div>
            )}
          </div>
        ) : activeTab === 'status' ? (
          <StatusList currentUser={currentUser} />
        ) : activeTab === 'profile' ? (
          <ProfileView currentUser={currentUser} />
        ) : (
          <div className="space-y-1">
            {filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center space-y-4 mt-20">
                <Flame className="w-12 h-12 opacity-20" />
                <p>No {activeTab}s found.</p>
              </div>
            ) : (
              filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 hover:bg-[#2c2c2c] transition-colors",
                    selectedChatId === chat.id && "bg-[#2b5278] hover:bg-[#2b5278]"
                  )}
                >
                  <div className="w-14 h-14 rounded-full bg-[#FF3B30] flex-shrink-0 flex items-center justify-center text-white font-bold text-xl overflow-hidden shadow-lg">
                    {chat.photoURL ? (
                      <img src={chat.photoURL} alt={chat.name} className="w-full h-full object-cover" />
                    ) : (
                      chat.name?.charAt(0) || '?'
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-white truncate">{chat.name}</h3>
                      <span className="text-xs text-gray-500">
                        {chat.lastMessageAt && format(chat.lastMessageAt.toDate(), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {chat.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-[#212121] border-t border-[#121212] flex justify-around p-2">
        <button 
          onClick={() => setActiveTab('chat')}
          className={cn("flex flex-col items-center p-2 rounded-xl transition-colors", activeTab === 'chat' ? "text-[#FF3B30]" : "text-gray-500 hover:bg-[#2c2c2c]")}
        >
          <Flame className="w-6 h-6" />
          <span className="text-[10px] mt-1">Chats</span>
        </button>
        <button 
          onClick={() => setActiveTab('group')}
          className={cn("flex flex-col items-center p-2 rounded-xl transition-colors", activeTab === 'group' ? "text-[#FF3B30]" : "text-gray-500 hover:bg-[#2c2c2c]")}
        >
          <Users className="w-6 h-6" />
          <span className="text-[10px] mt-1">Groups</span>
        </button>
        <button 
          onClick={() => setActiveTab('status')}
          className={cn("flex flex-col items-center p-2 rounded-xl transition-colors", activeTab === 'status' ? "text-[#FF3B30]" : "text-gray-500 hover:bg-[#2c2c2c]")}
        >
          <CircleDashed className="w-6 h-6" />
          <span className="text-[10px] mt-1">Status</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn("flex flex-col items-center p-2 rounded-xl transition-colors", activeTab === 'profile' ? "text-[#FF3B30]" : "text-gray-500 hover:bg-[#2c2c2c]")}
        >
          <UserIcon className="w-6 h-6" />
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      </div>

      {/* Floating Action Button */}
      {activeTab !== 'profile' && activeTab !== 'status' && (
        <button 
          onClick={onNewChat}
          className="absolute bottom-20 right-6 w-14 h-14 bg-[#FF3B30] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-10"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>
      )}
    </div>
  );
};

const AddMemberModal = ({ 
  chat, 
  currentUser, 
  onClose, 
  onAdd 
}: { 
  chat: Chat, 
  currentUser: User, 
  onClose: () => void, 
  onAdd: (uids: string[]) => void 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs
        .map(doc => doc.data() as User)
        .filter(u => !chat.members.includes(u.uid));
      setUsers(userData);
    });
    return () => unsubscribe();
  }, [chat.members]);

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phoneNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (uid: string) => {
    setSelectedUsers(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#212121] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[#3d3d3d]"
      >
        <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center bg-[#242424]">
          <h2 className="text-xl font-bold text-white">Add Members</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#3d3d3d] rounded-full text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2c2c2c] text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition-all text-sm"
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users found</p>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.uid}
                  onClick={() => toggleUser(user.uid)}
                  className={cn(
                    "w-full p-2 flex items-center gap-3 rounded-xl transition-colors",
                    selectedUsers.includes(user.uid) ? "bg-[#FF3B30]/20" : "hover:bg-[#2c2c2c]"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-gray-400" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-[10px] text-gray-500 truncate">
                      {user.email || user.phoneNumber || 'No contact info'}
                    </p>
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    selectedUsers.includes(user.uid) ? "bg-[#FF3B30] border-[#FF3B30]" : "border-gray-600"
                  )}>
                    {selectedUsers.includes(user.uid) && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              ))
            )}
          </div>
          <button 
            onClick={() => onAdd(selectedUsers)}
            disabled={selectedUsers.length === 0}
            className="w-full py-3 bg-[#FF3B30] rounded-xl font-bold hover:bg-[#D00000] disabled:opacity-50 transition-colors shadow-lg active:scale-95"
          >
            Add Selected ({selectedUsers.length})
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const GroupSettingsModal = ({ 
  chat, 
  currentUser, 
  onClose 
}: { 
  chat: Chat, 
  currentUser: User, 
  onClose: () => void 
}) => {
  const [settings, setSettings] = useState({
    isPublic: chat.isPublic || false,
    isChatLocked: chat.isChatLocked || false,
    isCallsLocked: chat.isCallsLocked || false,
    isAddMembersLocked: chat.isAddMembersLocked || false,
    isShareLocked: chat.isShareLocked || false,
    isReactionsLocked: chat.isReactionsLocked || false,
    managers: chat.managers || []
  });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const isAdmin = chat.createdBy === currentUser.uid;

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => doc.data() as User));
    });
    return () => unsubscribe();
  }, []);

  const updateSetting = async (key: string, value: any) => {
    try {
      await setDoc(doc(db, 'chats', chat.id), { [key]: value }, { merge: true });
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const toggleManager = async (uid: string) => {
    if (!isAdmin) return;
    let newManagers = [...settings.managers];
    if (newManagers.includes(uid)) {
      newManagers = newManagers.filter(id => id !== uid);
    } else {
      if (newManagers.length >= 10) {
        alert("Maximum 10 managers allowed");
        return;
      }
      newManagers.push(uid);
    }
    await updateSetting('managers', newManagers);
  };

  const SettingToggle = ({ label, icon: Icon, value, field }: { label: string, icon: any, value: boolean, field: string }) => (
    <div className="flex items-center justify-between p-3 bg-[#2c2c2c] rounded-xl">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <button 
        onClick={() => updateSetting(field, !value)}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative",
          value ? "bg-red-500" : "bg-green-500"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
          value ? "right-1" : "left-1"
        )} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#212121] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[#3d3d3d] flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center bg-[#242424]">
          <h2 className="text-xl font-bold text-white">Group Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#3d3d3d] rounded-full text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#FF3B30] uppercase tracking-wider">Privacy & Visibility</h3>
            <SettingToggle label="Public Group" icon={Globe} value={settings.isPublic} field="isPublic" />
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#FF3B30] uppercase tracking-wider">Permissions (Lock/Unlock)</h3>
            <SettingToggle label="Lock Chat (Admins Only)" icon={MessageCircleOff} value={settings.isChatLocked} field="isChatLocked" />
            <SettingToggle label="Lock Calls" icon={VolumeX} value={settings.isCallsLocked} field="isCallsLocked" />
            <SettingToggle label="Lock Member Adding" icon={UserPlus} value={settings.isAddMembersLocked} field="isAddMembersLocked" />
            <SettingToggle label="Lock Sharing" icon={Share2} value={settings.isShareLocked} field="isShareLocked" />
            <SettingToggle label="Lock Reactions" icon={Heart} value={settings.isReactionsLocked} field="isReactionsLocked" />
          </div>

          {isAdmin && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#FF3B30] uppercase tracking-wider">Managers ({settings.managers.length}/10)</h3>
              <div className="space-y-2">
                {allUsers.filter(u => chat.members.includes(u.uid) && u.uid !== chat.createdBy).map(user => (
                  <div key={user.uid} className="flex items-center justify-between p-2 hover:bg-[#2c2c2c] rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden">
                        {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-gray-400" />}
                      </div>
                      <span className="text-sm">{user.displayName}</span>
                    </div>
                    <button 
                      onClick={() => toggleManager(user.uid)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold transition-all",
                        settings.managers.includes(user.uid) ? "bg-red-500/20 text-red-500" : "bg-[#FF3B30]/20 text-[#FF3B30]"
                      )}
                    >
                      {settings.managers.includes(user.uid) ? "Remove Manager" : "Make Manager"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const VideoCallModal = ({ 
  user, 
  onClose 
}: { 
  user: { displayName: string, photoURL?: string }, 
  onClose: () => void 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
    >
      <div className="absolute top-10 text-center space-y-2">
        <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto overflow-hidden border-4 border-[#FF3B30]">
          {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-6 text-gray-400" />}
        </div>
        <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
        <p className="text-[#FF3B30] animate-pulse">Calling...</p>
      </div>

      <div className="flex-1 w-full max-w-2xl bg-[#1a1a1a] rounded-3xl overflow-hidden relative shadow-2xl border border-white/10 mt-20">
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="w-20 h-20 text-white/10" />
        </div>
        {/* Self View */}
        <div className="absolute bottom-4 right-4 w-32 h-48 bg-[#2c2c2c] rounded-xl border border-white/20 shadow-xl overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-6">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={cn("p-4 rounded-full transition-all", isMuted ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20")}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button 
          onClick={onClose}
          className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl transition-all active:scale-90"
        >
          <Phone className="w-8 h-8 rotate-[135deg]" />
        </button>
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={cn("p-4 rounded-full transition-all", isVideoOff ? "bg-red-500 text-white" : "bg-white/10 text-white hover:bg-white/20")}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
      </div>
    </motion.div>
  );
};

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar: boolean;
  chat?: Chat;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, showAvatar, chat }) => {
  const [showReactions, setShowReactions] = useState(false);
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '👎'];

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleReaction = async (emoji: string) => {
    if (chat?.isReactionsLocked && chat.createdBy !== auth.currentUser?.uid && !chat.managers?.includes(auth.currentUser?.uid || '')) {
      return;
    }
    // Simple reaction logic: update message with reactions map
    const msgRef = doc(db, 'chats', message.chatId, 'messages', message.id);
    const currentReactions = (message as any).reactions || {};
    const userReaction = currentReactions[auth.currentUser?.uid || ''];
    
    if (userReaction === emoji) {
      delete currentReactions[auth.currentUser?.uid || ''];
    } else {
      currentReactions[auth.currentUser?.uid || ''] = emoji;
    }
    
    await setDoc(msgRef, { reactions: currentReactions }, { merge: true });
    setShowReactions(false);
  };

  const reactionCounts = Object.values((message as any).reactions || {}).reduce((acc: any, emoji: any) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {});

  const renderFileContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img src={message.fileUrl || message.text} alt="" className="rounded-lg max-w-full h-auto shadow-md" />
            {message.text && message.text !== message.fileUrl && <p className="text-sm">{message.text}</p>}
          </div>
        );
      case 'video':
      case 'film':
        return (
          <div className="space-y-2 bg-black/20 p-2 rounded-xl border border-white/5">
            <div className="relative aspect-video bg-black rounded-lg flex items-center justify-center group cursor-pointer overflow-hidden">
              <Play className="w-10 h-10 text-white/50 group-hover:text-white transition-all" />
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white">
                {message.type === 'film' ? 'FILM' : 'VIDEO'}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{message.fileName || 'Video File'}</p>
                <p className="text-[10px] text-gray-400">{formatSize(message.fileSize)}</p>
              </div>
              <button className="p-2 bg-[#FF3B30] rounded-full hover:bg-[#D00000]">
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
            <button className="p-3 bg-[#FF3B30] rounded-full text-white">
              <Music className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName || 'Audio Track'}</p>
              <div className="h-1 bg-white/20 rounded-full mt-2 relative">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-white rounded-full"></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{formatSize(message.fileSize)}</p>
            </div>
          </div>
        );
      case 'app':
        return (
          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="p-3 bg-green-500 rounded-2xl text-white shadow-lg">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{message.fileName || 'Application'}</p>
              <p className="text-[10px] text-gray-400">Version 1.0.0 • {formatSize(message.fileSize)}</p>
              <button className="mt-2 text-xs text-[#FF3B30] font-bold hover:underline">INSTALL NOW</button>
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="p-3 bg-gray-700 rounded-xl text-white">
              <FileIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName || 'Document'}</p>
              <p className="text-[10px] text-gray-400">{formatSize(message.fileSize)}</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full">
              <Download className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        );
      default:
        return <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>;
    }
  };

  return (
    <div className={cn("flex items-end gap-2", isMe ? "flex-row-reverse" : "flex-row")}>
      {!isMe && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
          {showAvatar && message.senderPhoto && <img src={message.senderPhoto} alt="" className="w-full h-full object-cover" />}
        </div>
      )}
      <div className="relative group">
        <div 
          onDoubleClick={() => !chat?.isReactionsLocked && setShowReactions(true)}
          className={cn(
            "max-w-[70%] p-3 rounded-2xl relative shadow-md",
            isMe ? "bg-[#2b5278] text-white rounded-br-none" : "bg-[#1a1a1a] text-white rounded-bl-none"
          )}
        >
          {!isMe && showAvatar && <p className="text-xs font-bold text-[#FF3B30] mb-1">{message.senderName}</p>}
          {renderFileContent()}
          <div className="flex justify-end items-center gap-1 mt-1">
            <span className="text-[10px] text-gray-400">
              {message.createdAt && format(message.createdAt.toDate(), 'HH:mm')}
            </span>
            {isMe && <Check className="w-3 h-3 text-[#FF3B30]" />}
            {(!chat?.isShareLocked || chat.createdBy === auth.currentUser?.uid || chat.managers?.includes(auth.currentUser?.uid || '')) && (
              <button 
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                title="Forward Message"
              >
                <Share2 className="w-3 h-3 text-gray-400 hover:text-[#FF3B30]" />
              </button>
            )}
          </div>

          {/* Reaction Counts */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className={cn(
              "absolute -bottom-3 flex gap-1",
              isMe ? "right-0" : "left-0"
            )}>
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <div key={emoji} className="bg-[#2c2c2c] border border-[#3d3d3d] rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1 shadow-lg">
                  <span>{emoji}</span>
                  <span className="font-bold">{count as number}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reaction Picker */}
        <AnimatePresence>
          {showReactions && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 10 }}
              className={cn(
                "absolute -top-12 z-20 bg-[#2c2c2c] border border-[#3d3d3d] rounded-full p-1 flex gap-1 shadow-2xl",
                isMe ? "right-0" : "left-0"
              )}
            >
              {reactions.map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-xl"
                >
                  {emoji}
                </button>
              ))}
              <button onClick={() => setShowReactions(false)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ChatWindow = ({ 
  chat, 
  currentUser, 
  onBack 
}: { 
  chat: Chat, 
  currentUser: User, 
  onBack: () => void 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isManager = chat.managers?.includes(currentUser.uid) || chat.createdBy === currentUser.uid;
  const isBlocked = currentUser.blockedUsers?.includes(chat.id) || currentUser.blockedGroups?.includes(chat.id);
  const isMember = chat.members.includes(currentUser.uid);

  const handleAddMembers = async (uids: string[]) => {
    const newMembers = [...new Set([...chat.members, ...uids])];
    await setDoc(doc(db, 'chats', chat.id), { members: newMembers }, { merge: true });
    setIsAddMemberModalOpen(false);
  };

  useEffect(() => {
    if (!chat.id) return;
    const q = query(
      collection(db, 'chats', chat.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgData);
    });

    return () => unsubscribe();
  }, [chat.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBlocked || (chat.isChatLocked && !isManager)) return;

    const text = input;
    setInput('');

    try {
      await addDoc(collection(db, 'chats', chat.id, 'messages'), {
        chatId: chat.id,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        text: text,
        createdAt: serverTimestamp(),
        type: 'text'
      });

      await setDoc(doc(db, 'chats', chat.id), {
        lastMessage: text,
        lastMessageAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isBlocked || (chat.isChatLocked && !isManager)) return;

    // Simulate large file upload (up to 1024GB)
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Wait for simulation
    await new Promise(resolve => setTimeout(resolve, 2000));

    let type: Message['type'] = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';
    else if (file.name.endsWith('.apk') || file.name.endsWith('.exe') || file.name.endsWith('.dmg')) type = 'app';
    else if (file.size > 1024 * 1024 * 500) type = 'film'; // Large videos as films

    try {
      await addDoc(collection(db, 'chats', chat.id, 'messages'), {
        chatId: chat.id,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderPhoto: currentUser.photoURL,
        text: `Sent a ${type}: ${file.name}`,
        type,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file), // Local URL for demo
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, 'chats', chat.id), {
        lastMessage: `📎 ${file.name}`,
        lastMessageAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleBlock = async () => {
    const field = chat.type === 'private' ? 'blockedUsers' : 'blockedGroups';
    const currentList = currentUser[field] || [];
    const newList = currentList.includes(chat.id) 
      ? currentList.filter(id => id !== chat.id)
      : [...currentList, chat.id];
    
    await setDoc(doc(db, 'users', currentUser.uid), { [field]: newList }, { merge: true });
  };

  const handleJoinLeave = async () => {
    if (isMember) {
      // Leave
      const newMembers = chat.members.filter(id => id !== currentUser.uid);
      await setDoc(doc(db, 'chats', chat.id), { members: newMembers }, { merge: true });
      onBack();
    } else {
      // Join
      const newMembers = [...chat.members, currentUser.uid];
      await setDoc(doc(db, 'chats', chat.id), { members: newMembers }, { merge: true });
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="p-3 bg-black flex items-center gap-4 border-b border-[#121212] z-10">
        <button onClick={onBack} className="md:hidden p-2 hover:bg-[#2c2c2c] rounded-full">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="w-10 h-10 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold">
          {chat.photoURL ? (
            <img src={chat.photoURL} alt={chat.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            chat.name?.charAt(0) || '?'
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">{chat.name}</h3>
          <p className="text-xs text-[#FF3B30]">{isMember ? 'online' : 'Not a member'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isMember && !chat.isCallsLocked && (
            <>
              <button className="p-2 hover:bg-[#2c2c2c] rounded-full text-gray-400"><Phone className="w-5 h-5" /></button>
              <button 
                onClick={() => setIsCalling(true)}
                className="p-2 hover:bg-[#2c2c2c] rounded-full text-gray-400"
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}

          {isMember && chat.type === 'group' && (!chat.isAddMembersLocked || isManager) && (
            <button 
              onClick={() => setIsAddMemberModalOpen(true)}
              className="p-2 hover:bg-[#2c2c2c] rounded-full text-gray-400"
              title="Add Members"
            >
              <UserPlus className="w-5 h-5" />
            </button>
          )}
          
          <div className="relative group/menu">
            <button className="p-2 hover:bg-[#2c2c2c] rounded-full text-gray-400">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#212121] border border-[#3d3d3d] rounded-xl shadow-2xl py-2 hidden group-hover/menu:block z-20">
              {chat.type === 'group' && (
                <>
                  {isManager && (
                    <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-[#2c2c2c] flex items-center gap-2"
                    >
                      <UserCog className="w-4 h-4" /> Group Settings
                    </button>
                  )}
                  <button 
                    onClick={handleJoinLeave}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[#2c2c2c] flex items-center gap-2 text-red-500"
                  >
                    {isMember ? <LogOut className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isMember ? 'Leave Group' : 'Join Group'}
                  </button>
                </>
              )}
              <button 
                onClick={toggleBlock}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[#2c2c2c] flex items-center gap-2 text-red-500"
              >
                {isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar z-10"
      >
        {isBlocked ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <Shield className="w-16 h-16 opacity-20" />
            <p>You have blocked this {chat.type === 'private' ? 'user' : 'group'}</p>
            <button onClick={toggleBlock} className="text-[#FF3B30] font-bold hover:underline">Unblock to see messages</button>
          </div>
        ) : !isMember && chat.type === 'group' ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <Users className="w-16 h-16 opacity-20" />
            <p>Join this group to see messages</p>
            <button onClick={handleJoinLeave} className="px-6 py-2 bg-[#FF3B30] text-white rounded-full font-bold">Join Group</button>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.uid;
            const showAvatar = idx === 0 || messages[idx-1].senderId !== msg.senderId;
            
            return (
              <MessageBubble key={msg.id} message={msg} isMe={isMe} showAvatar={showAvatar} chat={chat} />
            );
          })
        )}
      </div>

      {isMember && !isBlocked && (
        <div className="bg-[#212121] z-10">
          {chat.isChatLocked && !isManager ? (
            <div className="p-4 text-center text-gray-500 text-sm italic border-t border-[#121212]">
              Only admins can send messages in this group.
            </div>
          ) : (
            <>
              {uploadProgress !== null && (
                <div className="px-4 py-2 bg-[#2c2c2c] border-t border-[#121212]">
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Uploading large file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-full bg-[#FF3B30]"
                    />
                  </div>
                </div>
              )}
              <form 
                onSubmit={handleSend}
                className="p-4 flex items-center gap-4"
              >
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-[#2c2c2c] rounded-full text-gray-400"
                >
                  <Paperclip className="w-6 h-6" />
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    placeholder="Write a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full bg-transparent text-white py-2 focus:outline-none"
                  />
                </div>
                <button type="button" className="p-2 hover:bg-[#2c2c2c] rounded-full text-gray-400"><Smile className="w-6 h-6" /></button>
                <button 
                  type="submit"
                  className="p-3 bg-[#FF3B30] hover:bg-[#D00000] rounded-full text-white transition-colors shadow-lg"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {isCalling && (
          <VideoCallModal 
            user={{ displayName: chat.name || 'User', photoURL: chat.photoURL }} 
            onClose={() => setIsCalling(false)} 
          />
        )}
        {isSettingsOpen && (
          <GroupSettingsModal 
            chat={chat} 
            currentUser={currentUser} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        )}
        {isAddMemberModalOpen && (
          <AddMemberModal 
            chat={chat} 
            currentUser={currentUser} 
            onClose={() => setIsAddMemberModalOpen(false)} 
            onAdd={handleAddMembers}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const NewChatModal = ({ 
  currentUser, 
  onClose, 
  onChatCreated 
}: { 
  currentUser: User, 
  onClose: () => void,
  onChatCreated: (chat: Chat) => void
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'select' | 'group'>('select');
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map(doc => doc.data() as User);
      setUsers(userData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser.uid]);

  const filteredUsers = users.filter(u => 
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phoneNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const createPrivateChat = async (otherUser: User) => {
    const chatId = [currentUser.uid, otherUser.uid].sort().join('_');
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    
    if (chatDoc.exists()) {
      onChatCreated({ id: chatDoc.id, ...chatDoc.data() } as Chat);
      return;
    }

    const newChat: Chat = {
      id: chatId,
      type: 'private',
      name: otherUser.displayName,
      photoURL: otherUser.photoURL,
      members: [currentUser.uid, otherUser.uid],
      createdBy: currentUser.uid,
      lastMessage: '',
      lastMessageAt: serverTimestamp()
    };

    await setDoc(doc(db, 'chats', chatId), newChat);
    onChatCreated(newChat);
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    const chatId = `group_${Date.now()}`;
    const newChat: Chat = {
      id: chatId,
      type: 'group',
      name: groupName,
      photoURL: `https://picsum.photos/seed/${chatId}/200`,
      members: [currentUser.uid, ...selectedUsers],
      createdBy: currentUser.uid,
      lastMessage: 'Group created',
      lastMessageAt: serverTimestamp()
    };

    await setDoc(doc(db, 'chats', chatId), newChat);
    onChatCreated(newChat);
  };

  const toggleUserSelection = (uid: string) => {
    setSelectedUsers(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#212121] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[#3d3d3d]"
      >
        <div className="p-4 border-b border-[#3d3d3d] flex justify-between items-center bg-[#242424]">
          <h2 className="text-xl font-bold text-white">
            {mode === 'select' ? 'New Message' : 'New Group'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#3d3d3d] rounded-full text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#2c2c2c] text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] transition-all text-sm"
            />
          </div>

          {mode === 'select' ? (
            <div className="space-y-2">
              <button 
                onClick={() => setMode('group')}
                className="w-full p-3 flex items-center gap-4 hover:bg-[#2c2c2c] rounded-xl transition-colors text-[#FF3B30]"
              >
                <div className="w-12 h-12 rounded-full bg-[#FF3B30]/20 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <p className="font-semibold">New Group</p>
              </button>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No users found</div>
                ) : (
                  filteredUsers.map(user => (
                    <button
                      key={user.uid}
                      onClick={() => createPrivateChat(user)}
                      className="w-full p-3 flex items-center gap-4 hover:bg-[#2c2c2c] rounded-xl transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#FF3B30] flex items-center justify-center text-white font-bold">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          user.displayName.charAt(0)
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{user.displayName}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email || user.phoneNumber || `@${user.displayName.toLowerCase().replace(/\s/g, '')}`}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Group Name" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-[#2c2c2c] rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF3B30]"
              />
              <p className="text-xs font-bold text-gray-500 uppercase">Select Members</p>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No users found</div>
                ) : (
                  filteredUsers.map(user => (
                    <button
                      key={user.uid}
                      onClick={() => toggleUserSelection(user.uid)}
                      className={cn(
                        "w-full p-2 flex items-center gap-3 rounded-xl transition-colors",
                        selectedUsers.includes(user.uid) ? "bg-[#FF3B30]/20" : "hover:bg-[#2c2c2c]"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
                        {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-gray-400" />}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate">{user.displayName}</p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {user.email || user.phoneNumber || 'No contact info'}
                        </p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedUsers.includes(user.uid) ? "bg-[#FF3B30] border-[#FF3B30]" : "border-gray-600"
                      )}>
                        {selectedUsers.includes(user.uid) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setMode('select')}
                  className="flex-1 py-3 bg-[#2c2c2c] rounded-xl font-bold hover:bg-[#3d3d3d] transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedUsers.length === 0}
                  className="flex-[2] py-3 bg-[#FF3B30] rounded-xl font-bold hover:bg-[#D00000] disabled:opacity-50 transition-colors shadow-lg active:scale-95"
                >
                  Create Group ({selectedUsers.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const AccountSwitcher = ({ 
  currentUser, 
  onClose, 
  onSwitch 
}: { 
  currentUser: User, 
  onClose: () => void,
  onSwitch: (uid: string) => void
}) => {
  const [savedAccounts, setSavedAccounts] = useState<User[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('telegram_saved_accounts');
    if (saved) {
      setSavedAccounts(JSON.parse(saved));
    }
  }, []);

  // Update saved accounts whenever currentUser changes
  useEffect(() => {
    const saved = localStorage.getItem('telegram_saved_accounts');
    let accounts: User[] = saved ? JSON.parse(saved) : [];
    
    const exists = accounts.find(a => a.uid === currentUser.uid);
    if (!exists) {
      accounts.push(currentUser);
    } else {
      // Update existing account info
      accounts = accounts.map(a => a.uid === currentUser.uid ? currentUser : a);
    }
    
    // Limit to 50 accounts as requested
    if (accounts.length > 50) accounts = accounts.slice(-50);
    
    localStorage.setItem('telegram_saved_accounts', JSON.stringify(accounts));
    setSavedAccounts(accounts);
  }, [currentUser]);

  const handleAddAccount = async () => {
    // To add a new account, we need to sign out first to trigger the login screen
    // but in a real multi-account app, we'd use multiple auth instances.
    // For this demo, we'll just sign out and let them log in with another account.
    await signOut(auth);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-end z-[60] backdrop-blur-sm">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-xs bg-[#212121] h-full shadow-2xl border-l border-[#3d3d3d] flex flex-col"
      >
        <div className="p-4 border-b border-[#3d3d3d] flex items-center gap-4 bg-[#242424]">
          <button onClick={onClose} className="p-2 hover:bg-[#3d3d3d] rounded-full text-gray-400">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-white">Accounts</h2>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase px-3 py-2 tracking-widest">Saved Accounts ({savedAccounts.length}/50)</p>
          {savedAccounts.map(acc => (
            <button
              key={acc.uid}
              onClick={() => acc.uid !== currentUser.uid && onSwitch(acc.uid)}
              className={cn(
                "w-full p-3 flex items-center gap-4 rounded-xl transition-all group",
                acc.uid === currentUser.uid ? "bg-[#FF3B30]/10 border border-[#FF3B30]/30" : "hover:bg-[#2c2c2c]"
              )}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gray-600 overflow-hidden border-2 border-transparent group-hover:border-[#FF3B30] transition-all">
                  {acc.photoURL ? <img src={acc.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-gray-400" />}
                </div>
                {acc.uid === currentUser.uid && (
                  <div className="absolute -bottom-1 -right-1 bg-[#FF3B30] rounded-full p-0.5 border-2 border-[#212121]">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className={cn("font-semibold truncate", acc.uid === currentUser.uid ? "text-[#FF3B30]" : "text-white")}>
                  {acc.displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">{acc.email || acc.phoneNumber}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[#3d3d3d] bg-[#242424]">
          <button 
            onClick={handleAddAccount}
            className="w-full py-4 bg-[#FF3B30] hover:bg-[#D00000] text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Add Another Account
          </button>
          <p className="text-[10px] text-center text-gray-500 mt-4 uppercase tracking-tighter">Switching accounts will require a quick re-authentication</p>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat, group, status, profile

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        // Listen to the user document in Firestore for the full profile
        const userDocRef = doc(db, 'users', u.uid);
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ id: docSnap.id, ...docSnap.data() } as any);
          } else {
            // If doc doesn't exist yet, set basic info from auth
            setUser({
              uid: u.uid,
              displayName: u.displayName || u.phoneNumber || 'Anonymous',
              photoURL: u.photoURL || '',
              email: u.email || '',
              phoneNumber: u.phoneNumber || ''
            });
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        if (unsubscribeFirestore) unsubscribeFirestore();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#FF3B30] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      <div className={cn(
        "flex h-full w-full",
        selectedChat ? "flex-row" : "flex-col md:flex-row"
      )}>
        <div className={cn(
          "h-full",
          selectedChat ? "hidden md:block" : "block w-full"
        )}>
          <Sidebar 
            currentUser={user} 
            onSelectChat={setSelectedChat} 
            selectedChatId={selectedChat?.id}
            onNewChat={() => setIsNewChatModalOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setIsAccountDrawerOpen={setIsAccountDrawerOpen}
          />
        </div>
        
        <div className={cn(
          "flex-1 h-full",
          !selectedChat ? "hidden md:flex items-center justify-center bg-black" : "block"
        )}>
          {selectedChat ? (
            <ChatWindow 
              chat={selectedChat} 
              currentUser={user} 
              onBack={() => setSelectedChat(null)} 
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-[#2c2c2c] rounded-full flex items-center justify-center mx-auto">
                <Flame className="w-12 h-12 text-gray-500" />
              </div>
              <p className="text-gray-500 bg-[#2c2c2c] px-4 py-1 rounded-full text-sm">Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isNewChatModalOpen && (
          <NewChatModal 
            currentUser={user} 
            onClose={() => setIsNewChatModalOpen(false)}
            onChatCreated={(chat) => {
              setSelectedChat(chat);
              setIsNewChatModalOpen(false);
            }}
          />
        )}
        {isAccountDrawerOpen && (
          <AccountSwitcher 
            currentUser={user}
            onClose={() => setIsAccountDrawerOpen(false)}
            onSwitch={async (uid) => {
              // In this demo, switching logs out the current user
              // and prompts for a new login. The list of accounts is persisted.
              await signOut(auth);
              setIsAccountDrawerOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3d3d3d;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4d4d4d;
        }
      `}</style>
    </div>
  );
}
