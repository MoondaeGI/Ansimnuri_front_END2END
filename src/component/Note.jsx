import {parseDate} from "../util";

export const Note = ({dto}) => {
    const {id, content, userId, nickname, regDate, recCount} = dto
    const date = parseDate(regDate)

    return (
        <div>
            <div>{id}</div>
            <div>{content}</div>
            <div>{userId}</div>
            <div>{recCount}</div>
            <div>{nickname}</div>
            <div>{date}</div>
        </div>
    )
}

export const NoteReply = ({dto}) => {
    const {id, content, userId, nickname, regDate, recCount} = dto
    const date = parseDate(regDate)

    return (
        <div>
            <div>{id}</div>
            <div>{content}</div>
            <div>{userId}</div>
            <div>{recCount}</div>
            <div>{nickname}</div>
            <div>{date}</div>
        </div>
    )
}