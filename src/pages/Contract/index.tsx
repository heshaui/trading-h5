import React from 'react';
import { observer } from 'mobx-react-lite';
import { ContractProvider } from '@/context/exchange-providers/ContractProvider';
import ContractContent from './components/ContractContent';

const Contract: React.FC = observer(() => {
    return (
        <ContractProvider>
            <ContractContent />
        </ContractProvider>
    );
});

export default Contract;

export const meta = {
  requireAuth: false,
  layout: 'header-only'
}

