
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
   createUserWithEmailAndPassword, 
   signInWithEmailAndPassword, 
   signOut, 
   onAuthStateChanged,
   fetchSignInMethodsForEmail, 
  } from 'firebase/auth';
import { auth } from '../firebase/firebase.js';

interface AuthContextType {
  user?: any;
  loading: boolean;
  signUp: (email: string, password: string, name:string, username:string) => Promise< void >;
  signIn: (email: string, password: string) => Promise< void >;
  logOut: () => { };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        console.log("No user is logged in");
      }
});
  },[])

  const signUp = async (email: string, password: string, name: string, username: string) => {
    
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if(signInMethods.length > 0){
        throw new Error('Email already in use');
      }else{
        await createUserWithEmailAndPassword(auth, email, password);
        const user = {name: name, username: username};
      }
  };

  const signIn = async (email: string, password: string) => {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if(signInMethods.length === 0){
        throw new Error('No account found with this email');
      }else{
        await signInWithEmailAndPassword(auth, email, password);
      }
      
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
