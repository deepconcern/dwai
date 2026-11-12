import { FC } from "react";

export type ErrorListProps = {
  /** Messages to show; nothing renders when empty. */
  errors: string[];
};

/** Shows the errors from a failed request as an alert, or nothing. */
export const ErrorList: FC<ErrorListProps> = ({ errors }) =>
  errors.length === 0 ? null : (
    <ul className="text-red-400" role="alert">
      {errors.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
