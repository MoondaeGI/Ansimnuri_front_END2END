import {parseDate} from "../util";
import {Button} from "react-bootstrap";
import {useState} from "react";
import axios from "axios";

export const Note = ({dto}) => {
    const {id, content, userId, nickname, latitude, longitude, regDate, recCount, replyCount} = dto
    const date = parseDate(regDate)

    const [form, setForm] = useState({
        id: id,
        content: content,
        userId: userId
    })

    function update(e) {
        e.preventDefault();
    }

    function deleteById(e) {
        e.preventDefault();
    }

    return (
        <div className="">
            <form>
                <div>
                    <div>{id}</div>
                    <div>{content}</div>
                    <div>{userId}</div>
                    <div>{recCount}</div>
                    <div>{nickname}</div>
                    <div>{date}</div>
                </div>
                <div>
                    <Button onClick={update()}>수정</Button>
                    <Button onClick={deleteById()}>삭제</Button>
                </div>
            </form>
            <div>
                <div>
                    <textarea></textarea>
                </div>
                <div>
                    <Button>등록</Button>
                    <Button>삭제</Button>
                </div>
            </div>
        </div>
    )
}

export const EmptyNote = ({latitude, longitude}) => {
    const [form, setForm] = useState({
        latitude: latitude,
        longitude: longitude,
        content: ''
    })

    const save = (e) => {
        e.preventDefault();
        axios.post('http://localhost/api/note', form)
            .then(res => {
                console.log(res)
            })
    }

    return (
        <div>
            <form>
                <textarea name="content"></textarea>
                <div>
                    <Button onClick={save}>등록</Button>
                    <Button oncClick={back}>취소</Button>
                </div>
            </form>
        </div>
    )
}

export const NoteReply = ({dto}) => {
    const {id, content, userId, nickname, regDate, recCount} = dto
    const date = parseDate(regDate)

    const update = (e) => {
        e.preventDefault();
    }

    const deleteById = (e) => {
        e.preventDefault();
    }

    return (
        <div>
            <div>
                <div>{id}</div>
                <div>{content}</div>
                <div>{userId}</div>
                <div>{recCount}</div>
                <div>{nickname}</div>
                <div>{date}</div>
            </div>
            <div>
                <Button onClick={update()}>수정</Button>
                <Button onClick={deleteById()}>삭제</Button>
            </div>
        </div>
    )
}