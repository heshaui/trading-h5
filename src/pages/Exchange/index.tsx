import React from 'react';
import { observer } from 'mobx-react-lite';
import { ExchangeProvider } from '@/context/exchange-providers/ExchangeProvider';
import ExchangeContent from './components/ExchangeContent';

const Exchange: React.FC = observer(() => {
    return (
        <ExchangeProvider>
            <ExchangeContent />
        </ExchangeProvider>
    );
});

export default Exchange;

export const meta = {
  requireAuth: false,
  layout: 'header-only'
}

