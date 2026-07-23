import { lazy, Suspense } from "react";
import "./index.css";
import { LoadingProvider, useLoading } from "./context/LoadingProvider";
import Loading from "./components/Loading";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));

const AppContent = () => {
  const { loading } = useLoading();

  return (
    <>
      {loading > 0 && <Loading percent={loading} />}
      <Suspense fallback={<div style={{ background: "#0a0a0c", minHeight: "100vh" }} />}>
        <MainContainer>
          <Suspense fallback={null}>
            <CharacterModel />
          </Suspense>
        </MainContainer>
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <LoadingProvider>
      <AppContent />
    </LoadingProvider>
  );
};

export default App;
