import {Button as B} from "react-bootstrap";

export const Button = ({children, className: _className, ...props}) => {
    const className = `${_className}`
    return <B className={className} {...props}>{children}</B>
}