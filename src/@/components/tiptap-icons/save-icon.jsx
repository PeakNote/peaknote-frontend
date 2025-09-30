import * as React from "react"

export const SaveIcon = React.memo(({
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
        d="M6 2.5C5.17157 2.5 4.5 3.17157 4.5 4V20C4.5 20.8284 5.17157 21.5 6 21.5H18C18.8284 21.5 19.5 20.8284 19.5 20V7.41421C19.5 6.88378 19.2893 6.37507 18.9142 6L16 3.08579C15.6249 2.71071 15.1162 2.5 14.5858 2.5H6ZM6 4.5H14V7.5C14 8.05228 14.4477 8.5 15 8.5H18.5V20H6V4.5ZM16 5.41421L18.0858 7.5H16V5.41421ZM7.5 11C7.5 10.4477 7.94772 10 8.5 10H15.5C16.0523 10 16.5 10.4477 16.5 11C16.5 11.5523 16.0523 12 15.5 12H8.5C7.94772 12 7.5 11.5523 7.5 11ZM7.5 15C7.5 14.4477 7.94772 14 8.5 14H15.5C16.0523 14 16.5 14.4477 16.5 15C16.5 15.5523 16.0523 16 15.5 16H8.5C7.94772 16 7.5 15.5523 7.5 15Z"
        fill="currentColor" />
    </svg>
  );
})

SaveIcon.displayName = "SaveIcon"
