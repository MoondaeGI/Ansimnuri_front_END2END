export const Table = ({columnList, dataList}) => {
  const thead =
    columnList.map(column => <th>{column}</th>)

  const tbody =
      dataList.map(data =>
          <tr>{
            data.map(data => <td>{data}</td>)
          }</tr>
      )

  return (
    <table>
      <thead>{thead}</thead>
      <tbody>{tbody}</tbody>
    </table>
  )
}
