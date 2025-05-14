import {Button as B} from "react-bootstrap";

export const Button = ({children, className: _className, ...props}) => {
    const customClass = `${_className}`
    return <B className={customClass} {...props}>{children}</B>
}