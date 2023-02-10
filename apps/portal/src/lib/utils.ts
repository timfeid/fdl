export async function timeEvent<T>(message: string, action: Promise<T>): Promise<T> {
  const startTime = new Date().getTime()
  const response = await action
  console.log(message, new Date().getTime()-startTime, 'ms')

  return response
}

export function extractNode(edges: {node: any}[]) {
  return edges.map(edge => edge.node)
}
