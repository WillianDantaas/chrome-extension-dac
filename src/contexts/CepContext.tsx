"use client"

import { createContext, useContext, useState, ReactNode } from 'react';
import { servicedCities } from '../data/servicedCities';

// Definir o tipo dos dados do Cep
interface CepData {
  cep: string;
  neighborhood: string;
  street: string;
  city: string;
  state: string;
  isServiced: boolean;
}

interface CepContextType {
  cepData: CepData | null;
  setCepData: (data: CepData) => void;
  fetchCepData: (cep: string) => Promise<void>;
}

const CepContext = createContext<CepContextType | undefined>(undefined);

interface CepProviderProps {
  children: ReactNode;
}

export const CepProvider: React.FC<CepProviderProps> = ({ children }) => {
  const [cepData, setCepData] = useState<CepData | null>(null);

  const fetchCepData = async (cep: string) => {
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cep}`);
      if (!response.ok) throw new Error('Erro ao consultar o CEP');
      const data = await response.json();
      
      // Verifica se a cidade está na lista de cidades atendidas
      const isServiced = servicedCities.some(
        (city) => city.city === data.city && city.state === data.state
      );

      setCepData({
        cep,
        neighborhood: data.neighborhood,
        street: data.street,
        city: data.city,
        state: data.state,
        isServiced,
      });
    } catch (error) {
      console.error('Erro na consulta ao BrasilAPI:', error);
      setCepData(null); // Em caso de erro, podemos resetar os dados.
    }
  };

  return (
    <CepContext.Provider value={{ cepData, setCepData, fetchCepData }}>
      {children}
    </CepContext.Provider>
  );
};

// Hook personalizado para acessar o CepContext
export const useCepContext = (): CepContextType => {
  const context = useContext(CepContext);
  if (!context) {
    throw new Error('useCepContext precisa ser usado com Provider');
  }
  return context;
};
