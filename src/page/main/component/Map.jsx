import {Note, NoteReply} from "../../../component";
import {useEffect, useState, useMemo} from "react";
import axios from "axios";

export const Map = () => {
  const [noteList, setNoteList] = useState([])

  useEffect(() => {
    axios.get("http://localhost:80/api/note")
        .then(res => {
          console.log(res)
          setNoteList(res.data);
        })
  }, [])

  return <div>지도</div>
}
