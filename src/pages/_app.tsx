import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import Header from "~/components/HeaderFooter/Header";
import Footer from "~/components/HeaderFooter/Footer";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className="flex flex-col min-h-screen font-roboto"> {/* Use Flexbox to structure the layout */}
        <Header />
        <main className="flex-grow"> {/* Allow the main content to grow */}
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
