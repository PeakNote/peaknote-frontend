import * as React from "react"

export const LoadingIcon = React.memo(({
  className,
  ...props
}) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.5C6.75329 2.5 2.5 6.75329 2.5 12C2.5 17.2467 6.75329 21.5 12 21.5C17.2467 21.5 21.5 17.2467 21.5 12C21.5 6.75329 17.2467 2.5 12 2.5ZM12 4.5C7.58172 4.5 4.5 7.58172 4.5 12C4.5 16.4183 7.58172 19.5 12 19.5C16.4183 19.5 19.5 16.4183 19.5 12C19.5 7.58172 16.4183 4.5 12 4.5ZM12 6.5C8.68629 6.5 6.5 8.68629 6.5 12C6.5 15.3137 8.68629 17.5 12 17.5C15.3137 17.5 17.5 15.3137 17.5 12C17.5 8.68629 15.3137 6.5 12 6.5Z"
        fill="currentColor" />
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="currentColor"
        opacity="0.4">
        <animate
          attributeName="opacity"
          values="0.4;1;0.4"
          dur="1.2s"
          repeatCount="indefinite" />
      </circle>
    </svg>
  );
})

LoadingIcon.displayName = "LoadingIcon"
