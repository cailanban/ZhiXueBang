// cytoscape 由 mermaid 间接引入，动态导入时使用
declare module 'cytoscape' {
  const cytoscape: any;
  export default cytoscape;
}