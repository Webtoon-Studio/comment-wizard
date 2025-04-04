import Button from "@incom/features/components/Button";
import CloseIcon from "@incom/features/components/CloseIcon";
import { useEffect, useState, type ComponentProps, type MouseEvent } from "react";

const ZoomOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 19H5V5h7V3H3v18h18v-9h-2zM14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3z" />
    </svg>
)

const ZoomInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path fill="currentColor" d="M9 9V3H7v2.59L3.91 2.5L2.5 3.91L5.59 7H3v2zm12 0V7h-2.59l3.09-3.09l-1.41-1.41L17 5.59V3h-2v6zM3 15v2h2.59L2.5 20.09l1.41 1.41L7 18.41V21h2v-6zm12 0v6h2v-2.59l3.09 3.09l1.41-1.41L18.41 17H21v-2z" />
    </svg>
)

interface ClientContainerProps extends ComponentProps<"div"> {}

export default function ClientContainer(props: ClientContainerProps) {
    const {
        children
    } = props;
    const [thisHeight, setThisHeight] = useState(720);
    const [fullScreen, setFullScreen] = useState(false);
    useEffect(() => {
        const handleWindowResize = () => {
            setThisHeight(window.innerHeight - 120);
        }

        // Removed due to snapping when interacting off center
        // document.documentElement.style.scrollSnapType = "y proximity";

        window.addEventListener("resize", handleWindowResize);
        handleWindowResize();
        
        return () => {
            window.removeEventListener("resize", handleWindowResize);
        }
    }, []);

    const handleZoomOut = function(event: MouseEvent) {
        setFullScreen(true);
    }

    const hanldeZoomIn = function(event: MouseEvent) {
        setFullScreen(false);
    }

    return (
        <div 
            className={[
                "py-[40px] snap-always snap-center",
                fullScreen 
                    ? "fixed inset-0 z-[999] w-screen h-screen px-[40px] bg-black/50 backdrop-blur-md" 
                    : "relative w-full h-fit"
            ].join(" ")}
        >
            <div 
                className="relative max-w-[1340px] w-full flex flex-col justify-stretch bg-white border-2 rounded-md"
                style={{
                    height: thisHeight
                }}
            >
                <div className="h-[40px] p-2 flex justify-end items-center border-b-2 bg-white">
                    {fullScreen ? (
                        <Button onClick={hanldeZoomIn}>
                            <CloseIcon />
                        </Button>
                    ) : (
                        <Button onClick={handleZoomOut}>
                            <ZoomOutIcon />
                        </Button>
                    )}
                </div>
                <div className="flex-auto overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}