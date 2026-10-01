import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  addNewSeller: (name: string, email: string, phone: string, cargo?: string) => User;
  isGestor: boolean;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_gestor_1',
    name: 'Maylla Lopes',
    email: 'maylla.lopes@lopes.com.br',
    role: 'gestor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    phone: '(11) 98877-1234',
    cargo: 'Diretora Comercial & Gestora de Expansão',
    meta_mensal: 500000,
  },
  {
    id: 'usr_vendedor_1',
    name: 'Carlos Silva',
    email: 'carlos.silva@lopes.com.br',
    role: 'vendedor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    phone: '(11) 97123-4567',
    cargo: 'Consultor Comercial Sênior (Imóveis & Serviços)',
    meta_mensal: 150000,
  },
  {
    id: 'usr_vendedor_2',
    name: 'Juliana Mendes',
    email: 'juliana.mendes@lopes.com.br',
    role: 'vendedor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    phone: '(11) 96541-8899',
    cargo: 'Consultora de Prospecção B2B (SP Capital)',
    meta_mensal: 150000,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('lopes_crm_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lopes_crm_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_USERS[0]; // Padrão Gestor Maylla Lopes
  });

  useEffect(() => {
    localStorage.setItem('lopes_crm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lopes_crm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lopes_crm_current_user');
    }
  }, [currentUser]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Validação de login simples (senhas demo aceitas: admin123 para gestor, vendedor123 ou 123456)
    const userFound = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userFound) {
      setCurrentUser(userFound);
      return true;
    }
    // Se o email não existir ainda mas for login de teste, cria vendedor temporário
    if (email.includes('@')) {
      const isGestorEmail = email.toLowerCase().includes('gestor') || email.toLowerCase().includes('maylla') || email.toLowerCase().includes('admin');
      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: isGestorEmail ? 'gestor' : 'vendedor',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
        cargo: isGestorEmail ? 'Gestor de Contas' : 'Consultor Comercial',
        meta_mensal: 100000,
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const addNewSeller = (name: string, email: string, phone: string, cargo: string = 'Consultor Comercial'): User => {
    const newUser: User = {
      id: `usr_vend_${Date.now()}`,
      name,
      email,
      phone,
      role: 'vendedor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      cargo,
      meta_mensal: 120000,
    };
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const isGestor = currentUser?.role === 'gestor';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUser,
        addNewSeller,
        isGestor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
