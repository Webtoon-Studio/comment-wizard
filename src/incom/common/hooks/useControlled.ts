import { useCallback, useRef, useState } from "react";

interface UseControlledProps<T> {
    controlled: T | undefined;
    default?: T | undefined;
}

export default function useControlled<T = unknown>(props: UseControlledProps<T>): [T | undefined, (newValue: T) => void] {
    const {
        controlled,
        default: defaultProp
    } = props;

    const { current: isControlled } = useRef(controlled !== undefined);
    const [valueState, setValue] = useState(defaultProp);
    const value = isControlled ? controlled : valueState;

    const setValueIfUncontrolled = useCallback((newValue: T): void => {
        if (!isControlled) {
          setValue(newValue);
        }
      }, []);
    
      return [value, setValueIfUncontrolled];
}