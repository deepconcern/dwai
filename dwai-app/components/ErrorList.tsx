import { FC } from "react";

export type ErrorListProps = {
  errors: string[];
};

// ErrorList shows errors from a failed request, or nothing.
export const ErrorList: FC<ErrorListProps> = ({ errors }) =>
  errors.length === 0 ? null : (
    <ul className="text-red-400" role="alert">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
