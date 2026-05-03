import { useState } from "react";
import { useSharedReports } from "./hooks/useSharedReports";
import { useSharedUsers }   from "./hooks/useSharedUsers";
import { useSubscription }  from "./hooks/useSubscription";
import { getSubscriptionStatus } from "./utils/helpers";
import { Login }            from "./pages/Login";
import { DriverApp }        from "./pages/DriverApp";
import { SupervisorApp }    from "./pages/SupervisorApp";
import { PaymentWall }      from "./components/PaymentWall";

export default function App() {
  const { users, saveUsers }                           = useSharedUsers();
  const { subscription, registerPayment, suspendService } = useSubscription();
  const [session, setSession]                          = useState(null);
  const sharedReports                                  = useSharedReports();

  const handleLogin  = (u) => setSession(u);
  const handleLogout = () => setSession(null);

  const subStatus = subscription ? getSubscriptionStatus(subscription) : null;
  const isBlocked =
    subStatus === "suspended" ||
    subStatus === "trial_expired" ||
    subStatus === "payment_due";

  return (
    <>
      {!session && (
        <Login users={users} onLogin={handleLogin} />
      )}

      {session && isBlocked && (
        <PaymentWall
          subscription={subscription}
          status={subStatus}
          onRegisterPayment={registerPayment}
        />
      )}

      {session && !isBlocked && session.role === "driver" && (
        <DriverApp
          user={session}
          onLogout={handleLogout}
          sharedReports={sharedReports}
          subscription={subscription}
        />
      )}

      {session && !isBlocked && session.role === "supervisor" && (
        <SupervisorApp
          user={session}
          users={users}
          saveUsers={saveUsers}
          onLogout={handleLogout}
          sharedReports={sharedReports}
          subscription={subscription}
          onRegisterPayment={registerPayment}
          onSuspend={suspendService}
        />
      )}
    </>
  );
}
