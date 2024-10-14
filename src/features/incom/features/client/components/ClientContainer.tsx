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
            <div className="border-2 rounded-md p-4">
                {children}
            </div>
        </div>
    )
}