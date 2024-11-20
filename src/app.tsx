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
          <MainNav theme={"dark"} />
          <Suspense>
            {props.children}
            {/* <SessionProvider>{props.children}</SessionProvider> */}
          </Suspense>
          {/* <Footer />
            <Toaster /> */}
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
