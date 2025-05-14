import {Button as B} from "react-bootstrap";

export const Button = ({name, className, ...props}) => {
    const customClassName = `${className}`
    return <B className={customClassName} {...props}>{name}</B>
} 