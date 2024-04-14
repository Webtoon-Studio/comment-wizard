import { useCallback, useRef, useState } from "react";

interface UseControlledProps<T> {
    controlled?: T;
    default?: T;
}

export default function useControlled<T = unknown>({ 
    controlled: state, default: defaultProp 
}: UseControlledProps<T>) {
    const { current: isControlled } = useRef(state !== undefined);
    const [valueState, setValueState] = useState(defaultProp);
    const value = isControlled ? state : valueState;

    const setValueIfUncontrolled = useCallback(
        (newValue: T) => {
            if (!isControlled) {
                setValueState(newValue);
            }
        },
        []
    );

    return [value, setValueIfUncontrolled] as const;
}