
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { AuthState, UserProfile, UserRole } from './types';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import VerifyEmail from './components/auth/VerifyEmail';
import CompleteProfile from './components/auth/CompleteProfile';
import LoadingSpinner from './components/common/LoadingSpinner';
import AppLayout from './components/layout/AppLayout';
import { ConversationsProvider } from './contexts/ConversationsContext';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    status: 'loading',
    user: null,
    profile: null,
  });
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload(); // Get the latest user state (especially emailVerified)
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // A user's profile can be marked as verified by an admin, bypassing the email link check.
        const profileIsAdminVerified = userDoc.exists() && userDoc.data().isVerified === true;

        if (!user.emailVerified && !profileIsAdminVerified) {
          setAuthState({ status: 'unverified', user, profile: null });
          return;
        }

        if (!userDoc.exists()) {
          setAuthState({ status: 'needs-profile', user, profile: null });
          return;
        }

        const profileData = userDoc.data();
        const profile: UserProfile = {
          ...profileData,
          createdAt: (profileData.createdAt as Timestamp).toDate(),
        } as UserProfile;

        if (profile.role === UserRole.CUSTOMER) {
            // This is a control system, customers are not allowed.
            await signOut(auth);
            // After sign out, the onAuthStateChanged will trigger again and set state to unauthenticated.
            // We can set it directly here as well to be faster.
            setAuthState({ status: 'unauthenticated', user: null, profile: null });
            // Maybe add an alert here for the user. For now, login will handle the error message.
            return;
        }

        setAuthState({ status: 'authenticated', user, profile });

      } else {
        setAuthState({ status: 'unauthenticated', user: null, profile: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (authState.status) {
      case 'loading':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <LoadingSpinner />
          </div>
        );
      case 'unauthenticated':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            {authView === 'login' ? <Login setView={setAuthView} /> : <Register setView={setAuthView} />}
          </div>
        );
      case 'unverified':
        return <VerifyEmail user={authState.user!} />;
      case 'needs-profile':
        return <CompleteProfile user={authState.user!} />;
      case 'authenticated':
        return (
          <ConversationsProvider currentUser={authState.profile!}>
            <AppLayout user={authState.user!} profile={authState.profile!} />
          </ConversationsProvider>
        );
      default:
        return null; // Should not happen
    }
  };

  return <div className="bg-gray-900 text-gray-100">{renderContent()}</div>;
};

export default App;
