import React, { HTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

interface StyledButtonProps extends HTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

const StyledButton: React.FC<PropsWithChildren<StyledButtonProps>> = ({
  children,
  selected,
  className,
  ...rest
}) => {
  return (
    <button
      className={clsx(
        "text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium rounded-full text-sm px-3 py-1 text-center",
        selected && "bg-red-700 hover:bg-red-800 focus:ring-red-300"
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default StyledButton;
