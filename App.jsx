import { useState } from "react";
import { useSharedReports } from "./useSharedReports";
import { useSharedUsers }   from "./useSharedUsers";
import { useSubscription }  from "./useSubscription";
import { getSubscriptionStatus } from "./helpers";
import { Login }            from "./Login";
import { DriverApp }        from "./DriverApp";
import { SupervisorApp }    from "./SupervisorApp";
import { PaymentWall }      from "./PaymentWall";

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
