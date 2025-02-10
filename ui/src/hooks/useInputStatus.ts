import { useRef } from "react";

export function useInputStatus<T>(
  value: T,
  validate?: (value: T) => boolean
): string | null {
  const previousValue = useRef(value);
  const hasBeenTouched = useRef(false);

  hasBeenTouched.current =
    hasBeenTouched.current || previousValue.current !== value;
  previousValue.current = value;

  if (!validate) return null;
  if (!hasBeenTouched.current) return null;

  const validity = validate(value);

  if (validity) return "is-success";
  return "is-error";
}
