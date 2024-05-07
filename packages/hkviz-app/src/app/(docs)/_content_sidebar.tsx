'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type ContentSidebarContext = {
    sidebarContainer: null | HTMLDivElement;
    setSidebarContainer: null | ((ref: null | HTMLDivElement) => void);
};
const ContentSidebarContext = createContext<ContentSidebarContext>({
    sidebarContainer: null,
    setSidebarContainer: null,
});

export function TOCStealer({ children }: { children: React.ReactNode }) {
    // const selfRef = useRef<HTMLDivElement>(null);
    // useEffect(() => {}, []);
    // const { sidebarContainer } = useContext(ContentSidebarContext);
    // if (sidebarContainer) {
    //     return createPortal(children, sidebarContainer);
    // } else {
    //     return <div ref={selfRef}>{children}</div>;
    // }
}

export function TOCContainer() {
    const { setSidebarContainer } = useContext(ContentSidebarContext);

    return (
        <div
            ref={(ref) => {
                setSidebarContainer?.(ref);
            }}
        ></div>
    );
}

export function TOCProvider({ children }: { children: React.ReactNode }) {
    const [sidebarContainer, setSidebarContainer] = useState<null | HTMLDivElement>(null);

    const contextValue = useMemo(
        () => ({
            sidebarContainer,
            setSidebarContainer,
        }),
        [sidebarContainer],
    );

    return <ContentSidebarContext.Provider value={contextValue}>{children}</ContentSidebarContext.Provider>;
}
