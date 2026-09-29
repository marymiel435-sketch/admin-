import { DashboardProvider } from './DashboardContext';
import { CustomerProvider } from './CustomerContext';
import { OrderProvider } from './OrderContext';
import { RiderProvider } from './RiderContext';
import { PresenceProvider } from './PresenceContext';
import { StoreProvider } from './StoreContext';
import { SosAlertProvider } from './SosAlertContext';

// Mirrors main.dart's MultiProvider — one place to nest every data context
// used once the admin is authenticated.
export default function AppProviders({ children }) {
  return (
    <DashboardProvider>
      <CustomerProvider>
        <OrderProvider>
          <RiderProvider>
            <PresenceProvider>
              <StoreProvider>
                <SosAlertProvider>{children}</SosAlertProvider>
              </StoreProvider>
            </PresenceProvider>
          </RiderProvider>
        </OrderProvider>
      </CustomerProvider>
    </DashboardProvider>
  );
}
