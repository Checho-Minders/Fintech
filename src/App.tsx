import React, { useState, useEffect, useCallback } from 'react';
import { Screen, TransferData } from './types';
import { MovementsProvider, useMovements } from './context/MovementsContext';
import { UserProvider } from './context/UserContext';
import { formatUSD } from './utils/format';

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center font-bold text-white">M</div>
    <span className="text-xl font-bold text-white">Minders Pay</span>
  </div>
);

import { LoginScreen } from './screens/Login';
import { RegisterPhoneScreen, RegisterDataScreen, KycDocScreen, KycSelfieScreen, KycReviewScreen, PinCreateScreen, WelcomeScreen } from './screens/Registration';
import { DashboardScreen } from './screens/Dashboard';
import { MovementsScreen } from './screens/Movements';
import { TransactionDetailScreen } from './screens/TransactionDetail';
import { FinanceScreen } from './screens/Finance';
import { TopupChannelScreen, TopupInstructionsScreen, TopupCashScreen, TopupSuccessScreen } from './screens/Topup';
import { NotificationsScreen } from './screens/Notifications';
import { TransferScreen, TransferConfirmScreen } from './screens/Transfer';
import { ProductsScreen } from './screens/Products';
import { MarketScreen } from './screens/Market';
import { MarketHubScreen } from './screens/MarketHub';
import { CdtDigitalScreen } from './screens/CdtDigital';
import { DailyYieldScreen } from './screens/DailyYield';
import { InvestmentHubScreen } from './screens/InvestmentHub';
import { CardsScreen } from './screens/Cards';
import { CardManageScreen } from './screens/CardManage';
import { CardPinScreen } from './screens/CardPin';
import { CardDetailScreen } from './screens/CardDetail';
import { ChargeQrScreen } from './screens/ChargeQr';
import { MobileTopupScreen } from './screens/MobileTopup';
import { OperationSuccessScreen } from './screens/OperationSuccess';
import { SalesStatsScreen } from './screens/SalesStats';
import { CreatePaymentLinkScreen } from './screens/CreatePaymentLink';
import { BusinessDashboardScreen } from './screens/BusinessDashboard';
import { InsuranceDetailScreen } from './screens/InsuranceDetail';
import { InsuranceWizardScreen } from './screens/InsuranceWizard';
import { InsuranceHubScreen } from './screens/InsuranceHub';
import { CreditSignScreen } from './screens/CreditSign';
import { CreditOfferScreen } from './screens/CreditOffer';
import { PocketDetailScreen } from './screens/PocketDetail';
import { CreatePocketScreen } from './screens/CreatePocket';
import { SavingsHubScreen } from './screens/SavingsHub';
import { ReferralsScreen } from './screens/Referrals';
import { BenefitsScreen } from './screens/Benefits';
import { AiSupportScreen } from './screens/AiSupport';
import { SecurityScreen } from './screens/Security';
import { CatalogScreen } from './screens/Catalog';
import { ProfileScreen } from './screens/Profile';
import { PayServicesScreen } from './screens/PayServices';
import { DashboardLayout } from './components/Layout';

// --- Hash Routing Helpers ---

const VALID_SCREENS: Screen[] = [
  'login', 'register_phone', 'register_data', 'kyc_doc', 'kyc_selfie',
  'kyc_review', 'pin_create', 'welcome', 'dashboard', 'movements',
  'transaction_detail', 'finance', 'topup_channel', 'topup_instructions',
  'topup_cash', 'topup_success', 'notifications', 'transfer',
  'transfer_confirm', 'operation_success', 'products', 'market',
  'market_hub', 'cdt_digital', 'daily_yield', 'investment_hub', 'cards',
  'card_manage', 'card_pin', 'card_detail', 'charge_qr', 'mobile_topup',
  'sales_stats', 'create_payment_link', 'business_dashboard',
  'insurance_detail', 'insurance_wizard', 'insurance_hub', 'credit_sign',
  'credit_offer', 'pocket_detail', 'create_pocket', 'savings_hub',
  'referrals', 'benefits', 'ai_support', 'security', 'catalog', 'profile',
  'pay_services',
];

/** Read current screen from the URL hash, e.g. #/dashboard -> 'dashboard' */
function getScreenFromHash(): Screen {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash && VALID_SCREENS.includes(hash as Screen)) {
    return hash as Screen;
  }
  return 'login';
}

/** Write a screen name into the URL hash */
function setHash(screen: Screen) {
  const newHash = `#/${screen}`;
  if (window.location.hash !== newHash) {
    window.location.hash = newHash;
  }
}

function MainContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(getScreenFromHash);
  const [transferData, setTransferData] = useState<TransferData | undefined>();
  const { addTransaction, updateBalance } = useMovements();

  // Listen for browser back / forward buttons
  useEffect(() => {
    const onHashChange = () => {
      const screen = getScreenFromHash();
      setCurrentScreen(screen);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Keep hash in sync when screen changes programmatically
  useEffect(() => {
    setHash(currentScreen);
  }, [currentScreen]);

  const navigate = useCallback((screen: Screen, data?: TransferData) => {
    if (!data) {
      setTransferData(undefined);
    }
    if (data) {
      setTransferData(data);
      if (screen === 'operation_success' && data.successType === 'transfer') {
        const amount = parseFloat(data.amount);
        addTransaction({
          id: Math.random().toString(36).substr(2, 9),
          type: 'transfer_out',
          status: 'completed',
          amount: amount,
          formattedAmount: `- ${formatUSD(amount)}`,
          recipientName: data.recipient,
          concept: 'Transferencia enviada',
          category: 'Transferencia',
          createdAtISO: new Date().toISOString(),
          dateLabel: 'Hoy',
          timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          operationNumber: `#TRX-${Math.floor(Math.random() * 1000000000)}`
        });
        updateBalance(amount, 'subtract');
      }
    }
    setCurrentScreen(screen);
  }, [addTransaction, updateBalance]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login': return <LoginScreen navigate={navigate} />;
      case 'register_phone': return <RegisterPhoneScreen navigate={navigate} />;
      case 'register_data': return <RegisterDataScreen navigate={navigate} />;
      case 'kyc_doc': return <KycDocScreen navigate={navigate} />;
      case 'kyc_selfie': return <KycSelfieScreen navigate={navigate} />;
      case 'kyc_review': return <KycReviewScreen navigate={navigate} />;
      case 'pin_create': return <PinCreateScreen navigate={navigate} />;
      case 'welcome': return <WelcomeScreen navigate={navigate} />;
      case 'dashboard': return <DashboardLayout current="dashboard" navigate={navigate}><DashboardScreen navigate={navigate} /></DashboardLayout>;
      case 'movements': return <DashboardLayout current="movements" navigate={navigate}><MovementsScreen navigate={navigate} /></DashboardLayout>;
      case 'transaction_detail': return <DashboardLayout current="transaction_detail" navigate={navigate}><TransactionDetailScreen navigate={navigate} data={transferData} /></DashboardLayout>;
      case 'finance': return <DashboardLayout current="finance" navigate={navigate}><FinanceScreen navigate={navigate} /></DashboardLayout>;
      case 'topup_channel': return <DashboardLayout current="topup_channel" navigate={navigate}><TopupChannelScreen navigate={navigate} /></DashboardLayout>;
      case 'topup_instructions': return <DashboardLayout current="topup_instructions" navigate={navigate}><TopupInstructionsScreen navigate={navigate} /></DashboardLayout>;
      case 'topup_cash': return <DashboardLayout current="topup_cash" navigate={navigate}><TopupCashScreen navigate={navigate} /></DashboardLayout>;
      case 'topup_success': return <DashboardLayout current="topup_success" navigate={navigate}><TopupSuccessScreen navigate={navigate} data={transferData} /></DashboardLayout>;
      case 'notifications': return <DashboardLayout current="notifications" navigate={navigate}><NotificationsScreen navigate={navigate} /></DashboardLayout>;
      case 'transfer': return <DashboardLayout current="transfer" navigate={navigate}><TransferScreen navigate={navigate} /></DashboardLayout>;
      case 'transfer_confirm': return <DashboardLayout current="transfer_confirm" navigate={navigate}><TransferConfirmScreen navigate={navigate} data={transferData} /></DashboardLayout>;
      case 'operation_success': return <DashboardLayout current="operation_success" navigate={navigate}><OperationSuccessScreen navigate={navigate} data={transferData} /></DashboardLayout>;
      case 'products': return <DashboardLayout current="products" navigate={navigate}><ProductsScreen navigate={navigate} /></DashboardLayout>;
      case 'market': return <DashboardLayout current="market" navigate={navigate}><MarketScreen navigate={navigate} /></DashboardLayout>;
      case 'market_hub': return <DashboardLayout current="market_hub" navigate={navigate}><MarketHubScreen navigate={navigate} /></DashboardLayout>;
      case 'cdt_digital': return <DashboardLayout current="cdt_digital" navigate={navigate}><CdtDigitalScreen navigate={navigate} /></DashboardLayout>;
      case 'daily_yield': return <DashboardLayout current="daily_yield" navigate={navigate}><DailyYieldScreen navigate={navigate} /></DashboardLayout>;
      case 'investment_hub': return <DashboardLayout current="investment_hub" navigate={navigate}><InvestmentHubScreen navigate={navigate} /></DashboardLayout>;
      case 'cards': return <DashboardLayout current="cards" navigate={navigate}><CardsScreen navigate={navigate} /></DashboardLayout>;
      case 'card_manage': return <DashboardLayout current="card_manage" navigate={navigate}><CardManageScreen navigate={navigate} /></DashboardLayout>;
      case 'card_pin': return <DashboardLayout current="card_pin" navigate={navigate}><CardPinScreen navigate={navigate} /></DashboardLayout>;
      case 'card_detail': return <DashboardLayout current="card_detail" navigate={navigate}><CardDetailScreen navigate={navigate} /></DashboardLayout>;
      case 'charge_qr': return <DashboardLayout current="charge_qr" navigate={navigate}><ChargeQrScreen navigate={navigate} /></DashboardLayout>;
      case 'mobile_topup': return <DashboardLayout current="mobile_topup" navigate={navigate}><MobileTopupScreen navigate={navigate} /></DashboardLayout>;
      case 'sales_stats': return <DashboardLayout current="sales_stats" navigate={navigate}><SalesStatsScreen navigate={navigate} /></DashboardLayout>;
      case 'create_payment_link': return <DashboardLayout current="create_payment_link" navigate={navigate}><CreatePaymentLinkScreen navigate={navigate} /></DashboardLayout>;
      case 'business_dashboard': return <DashboardLayout current="business_dashboard" navigate={navigate}><BusinessDashboardScreen navigate={navigate} /></DashboardLayout>;
      case 'insurance_detail': return <DashboardLayout current="insurance_detail" navigate={navigate}><InsuranceDetailScreen navigate={navigate} /></DashboardLayout>;
      case 'insurance_wizard': return <DashboardLayout current="insurance_wizard" navigate={navigate}><InsuranceWizardScreen navigate={navigate} /></DashboardLayout>;
      case 'insurance_hub': return <DashboardLayout current="insurance_hub" navigate={navigate}><InsuranceHubScreen navigate={navigate} /></DashboardLayout>;
      case 'credit_sign': return <DashboardLayout current="credit_sign" navigate={navigate}><CreditSignScreen navigate={navigate} /></DashboardLayout>;
      case 'credit_offer': return <DashboardLayout current="credit_offer" navigate={navigate}><CreditOfferScreen navigate={navigate} /></DashboardLayout>;
      case 'pocket_detail': return <DashboardLayout current="pocket_detail" navigate={navigate}><PocketDetailScreen navigate={navigate} /></DashboardLayout>;
      case 'create_pocket': return <DashboardLayout current="create_pocket" navigate={navigate}><CreatePocketScreen navigate={navigate} /></DashboardLayout>;
      case 'savings_hub': return <DashboardLayout current="savings_hub" navigate={navigate}><SavingsHubScreen navigate={navigate} /></DashboardLayout>;
      case 'referrals': return <DashboardLayout current="referrals" navigate={navigate}><ReferralsScreen navigate={navigate} /></DashboardLayout>;
      case 'benefits': return <DashboardLayout current="benefits" navigate={navigate}><BenefitsScreen navigate={navigate} /></DashboardLayout>;
      case 'ai_support': return <DashboardLayout current="ai_support" navigate={navigate}><AiSupportScreen navigate={navigate} /></DashboardLayout>;
      case 'security': return <DashboardLayout current="security" navigate={navigate}><SecurityScreen navigate={navigate} /></DashboardLayout>;
      case 'catalog': return <DashboardLayout current="catalog" navigate={navigate}><CatalogScreen navigate={navigate} /></DashboardLayout>;
      case 'profile': return <DashboardLayout current="profile" navigate={navigate}><ProfileScreen navigate={navigate} /></DashboardLayout>;
      case 'pay_services': return <DashboardLayout current="pay_services" navigate={navigate}><PayServicesScreen navigate={navigate} /></DashboardLayout>;
      default: return <LoginScreen navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-white font-sans selection:bg-brand-orange/30">
      {renderScreen()}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <MovementsProvider>
        <MainContent />
      </MovementsProvider>
    </UserProvider>
  );
}
