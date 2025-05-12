import {useNavigate} from "react-router-dom";
import {Button} from "react-bootstrap";
import {useState} from "react";

export const Write = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({})

  const back = (e) => {
    e.preventDefault();

    if (window.confirm("정말로 돌아가시겠습니까? 기존의 작업 내용이 모두 사라집니다.")) {
      navigate('/notice/list')
    }
  }

  const save = (e) => {
    e.preventDefault();

    alert("공지가 등록되었습니다.")
    navigate('/notice/list')
  }

  return (
      <div>
        <form onSubmit={save}>
          <table>
            <thead>
              <tr>
                <th>글쓰기</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>제목</th>
                <td><input name="title" type="text" /></td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <textarea name="content" rows="10" cols="50" />
                </td>
              </tr>
            </tbody>
          </table>
          <div>
            <Button onClick={back}>돌아가기</Button>
            <Button onClick={save}>등록하기</Button>
          </div>
        </form>
      </div>
  )
}
