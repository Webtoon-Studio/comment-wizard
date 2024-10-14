import { useEffect, useState, type ComponentProps } from "react";

interface ClientContainerProps extends ComponentProps<"div"> {}

export default function ClientContainer(props: ClientContainerProps) {
    const {
        children
    } = props;
    const [thisHeight, setThisHeight] = useState(720);

    useEffect(() => {
        const handleWindowResize = () => {
            setThisHeight(window.innerHeight);
        }

        window.addEventListener("resize", handleWindowResize);
        handleWindowResize();
        
        return () => {
            window.removeEventListener("resize", handleWindowResize);
        }
    }, [])

    return (
        <div 
            className="w-full p-2"
            style={{
                height: thisHeight
            }}
        >
            <div className="w-full h-full border-2 rounded-md">
                {children}
            </div>
        </div>
    )
}