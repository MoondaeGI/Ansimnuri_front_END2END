export const Table = ({columnList, dataList, ...props}) => {
  const thead =
    columnList.map((column, index) => <th key={index}>{column}</th>)

  const tbody =
      dataList.map((data, index) =>
          <tr key={index}>{
                  Object.entries(data).map(
                      ([key, value]) => <td key={key}>{value}</td>)
              }
          </tr>
      )

  return (
    <table {...props}>
      <thead>
        <tr>{thead}</tr>
      </thead>
      <tbody>{tbody}</tbody>
    </table>
  )
}
