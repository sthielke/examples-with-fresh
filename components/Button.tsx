import type { ComponentChildren } from "preact";

export interface ButtonProps {
  id?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children?: ComponentChildren;
  disabled?: boolean;
  variant?: "primary" | "outline" | "success" | "danger";
  size?: "sm" | "md";
  class?: string;
  style?: string;
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    class: className = "",
    ...rest
  } = props;

  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "",
    className,
  ].filter(Boolean).join(" ");

  return <button {...rest} class={classes} />;
}
