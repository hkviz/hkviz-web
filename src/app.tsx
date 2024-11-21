import { SessionProvider } from "@solid-mediakit/auth/client";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import { MainNav } from "./components/main-nav/main-nav";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>HKViz</Title>
          <SessionProvider>
            <MainNav theme={"dark"} />
            <Suspense>{props.children}</Suspense>
            {/* <Footer />
            <Toaster /> */}
          </SessionProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
